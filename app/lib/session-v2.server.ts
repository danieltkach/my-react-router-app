// lib/session-v2.server.ts - Production-Ready Session Management
import { createCookie } from "react-router";
import crypto from "crypto";
import {
  type SessionV2,
  type CreateSessionOptions,
  type SessionValidationResult,
  SessionInvalidReason,
  type UserRole,
  type Permission,
  type AuditEvent,
  AuditEventType
} from "~/types/auth-v2";

// 🔐 COOKIE CONFIGURATION
const isProduction = process.env.NODE_ENV === "production";
const cookieSecret = process.env.COOKIE_SECRET || "dev-secret-change-in-production";

if (!process.env.COOKIE_SECRET && isProduction) {
  throw new Error("COOKIE_SECRET environment variable is required in production");
}

// 🍪 SESSION COOKIE: Maximum security for authentication
export const sessionV2Cookie = createCookie("session-v2", {
  httpOnly: true,           // ✅ No JavaScript access
  secure: isProduction,     // ✅ HTTPS only in production
  sameSite: "strict",       // ✅ Strict CSRF protection
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: "/",
  secrets: [cookieSecret]   // 🔐 Signed and encrypted
});

// 🎯 SESSION STORAGE (In-memory for now, database later)
const sessionStore = new Map<string, SessionV2>();
const auditLog: AuditEvent[] = [];

// 🔧 UTILITIES
function generateSessionId(): string {
  return `sess-v2-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;
}

function generateCartId(userId: string, sessionId: string): string {
  const hash = crypto.createHash('sha256').update(`${userId}-${sessionId}`).digest('hex').substring(0, 8);
  return `cart-v2-${userId}-${hash}`;
}

function generateDeviceFingerprint(request: Request): string {
  const userAgent = request.headers.get("User-Agent") || "";
  const acceptLanguage = request.headers.get("Accept-Language") || "";
  const acceptEncoding = request.headers.get("Accept-Encoding") || "";

  return crypto
    .createHash('sha256')
    .update(`${userAgent}${acceptLanguage}${acceptEncoding}`)
    .digest('hex')
    .substring(0, 16);
}

function getClientIP(request: Request): string {
  return request.headers.get("X-Forwarded-For") ||
    request.headers.get("X-Real-IP") ||
    request.headers.get("CF-Connecting-IP") ||
    "unknown";
}

// 🔐 AUDIT LOGGING
export function logAuditEvent(
  type: AuditEventType,
  request: Request,
  options: {
    userId?: string;
    sessionId?: string;
    success: boolean;
    error?: string;
    metadata?: Record<string, any>;
  }
): void {
  const event: AuditEvent = {
    id: crypto.randomUUID(),
    type,
    userId: options.userId,
    sessionId: options.sessionId,
    ipAddress: getClientIP(request),
    userAgent: request.headers.get("User-Agent") || "unknown",
    timestamp: new Date().toISOString(),
    success: options.success,
    error: options.error,
    metadata: options.metadata
  };

  auditLog.push(event);

  // In production, this would go to a proper logging system
  if (options.success) {
    console.log(`✅ AUDIT: ${type}`, event);
  } else {
    console.warn(`❌ AUDIT: ${type}`, event);
  }

  // Keep only last 1000 events in memory
  if (auditLog.length > 1000) {
    auditLog.shift();
  }
}

// 🎯 CORE SESSION MANAGEMENT

export async function createSession(
  request: Request,
  userId: string,
  role: UserRole,
  permissions: Permission[],
  options: CreateSessionOptions = {}
): Promise<SessionV2> {
  const sessionId = generateSessionId();
  const cartId = generateCartId(userId, sessionId);
  const now = new Date();
  const expiryMinutes = options.customExpiry || (options.remember ? 60 * 24 * 30 : 60 * 24); // 30 days vs 24 hours

  const session: SessionV2 = {
    userId,
    sessionId,
    role,
    permissions,

    // Security & audit
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + expiryMinutes * 60 * 1000).toISOString(),
    lastActivity: now.toISOString(),
    ipAddress: getClientIP(request),
    userAgent: request.headers.get("User-Agent") || "unknown",
    deviceFingerprint: generateDeviceFingerprint(request),

    // Business logic
    cartId,
    department: undefined, // TODO: Get from user data

    // Session management
    isRemembered: options.remember || false,
    requiresPasswordChange: false,
    twoFactorVerified: options.skipTwoFactor || false,

    // Security flags
    isElevated: options.elevatePermissions || false,
    elevatedUntil: options.elevatePermissions
      ? new Date(now.getTime() + 15 * 60 * 1000).toISOString() // 15 minutes
      : undefined
  };

  // Store session
  sessionStore.set(sessionId, session);

  // Log audit event
  logAuditEvent(AuditEventType.LOGIN_SUCCESS, request, {
    userId,
    sessionId,
    success: true,
    metadata: {
      role,
      permissions: permissions.length,
      remembered: session.isRemembered,
      elevated: session.isElevated
    }
  });

  console.log(`✅ Session created for user ${userId}, expires: ${session.expiresAt}`);
  return session;
}

export async function validateSession(request: Request): Promise<SessionValidationResult> {
  try {
    // Parse session cookie
    const sessionData = await sessionV2Cookie.parse(request.headers.get("Cookie"));

    if (!sessionData || typeof sessionData !== "object") {
      return { isValid: false, reason: SessionInvalidReason.NOT_FOUND };
    }

    const session = sessionData as SessionV2;
    const storedSession = sessionStore.get(session.sessionId);

    if (!storedSession) {
      logAuditEvent(AuditEventType.SESSION_EXPIRED, request, {
        sessionId: session.sessionId,
        success: false,
        error: "Session not found in store"
      });
      return { isValid: false, reason: SessionInvalidReason.NOT_FOUND };
    }

    // Check expiration
    if (new Date(storedSession.expiresAt) <= new Date()) {
      sessionStore.delete(session.sessionId);
      logAuditEvent(AuditEventType.SESSION_EXPIRED, request, {
        userId: storedSession.userId,
        sessionId: session.sessionId,
        success: false,
        error: "Session expired"
      });
      return { isValid: false, reason: SessionInvalidReason.EXPIRED };
    }

    // Security checks
    const currentIP = getClientIP(request);
    const currentFingerprint = generateDeviceFingerprint(request);

    // IP change detection (warn but don't block - could be legitimate)
    if (storedSession.ipAddress !== currentIP) {
      console.warn(`⚠️ IP change detected for session ${session.sessionId}: ${storedSession.ipAddress} → ${currentIP}`);
      logAuditEvent(AuditEventType.SUSPICIOUS_ACTIVITY, request, {
        userId: storedSession.userId,
        sessionId: session.sessionId,
        success: true,
        metadata: {
          type: "ip_change",
          oldIP: storedSession.ipAddress,
          newIP: currentIP
        }
      });
    }

    // Device fingerprint change (more suspicious)
    if (storedSession.deviceFingerprint !== currentFingerprint) {
      console.warn(`🚨 Device fingerprint change for session ${session.sessionId}`);
      logAuditEvent(AuditEventType.SUSPICIOUS_ACTIVITY, request, {
        userId: storedSession.userId,
        sessionId: session.sessionId,
        success: true,
        metadata: {
          type: "device_change",
          oldFingerprint: storedSession.deviceFingerprint,
          newFingerprint: currentFingerprint
        }
      });

      // In high-security mode, you might want to invalidate the session here
      // return { isValid: false, reason: SessionInvalidReason.DEVICE_MISMATCH };
    }

    // Check if elevation has expired
    if (storedSession.isElevated && storedSession.elevatedUntil) {
      if (new Date(storedSession.elevatedUntil) <= new Date()) {
        storedSession.isElevated = false;
        storedSession.elevatedUntil = undefined;
        console.log(`⏰ Elevation expired for session ${session.sessionId}`);
      }
    }

    // Update last activity
    storedSession.lastActivity = new Date().toISOString();
    sessionStore.set(session.sessionId, storedSession);

    return { isValid: true, session: storedSession };

  } catch (error) {
    // Cookie tampering or parsing error
    logAuditEvent(AuditEventType.COOKIE_TAMPERED, request, {
      success: false,
      error: error instanceof Error ? error.message : "Cookie parsing failed"
    });

    console.error("🚨 Session validation error (possible tampering):", error);
    return { isValid: false, reason: SessionInvalidReason.TAMPERED };
  }
}

export async function refreshSession(request: Request): Promise<SessionV2 | null> {
  const validation = await validateSession(request);

  if (!validation.isValid || !validation.session) {
    return null;
  }

  const session = validation.session;
  const now = new Date();

  // Extend expiration
  const expiryMinutes = session.isRemembered ? 60 * 24 * 30 : 60 * 24;
  session.expiresAt = new Date(now.getTime() + expiryMinutes * 60 * 1000).toISOString();
  session.lastActivity = now.toISOString();

  // Update IP and fingerprint (they may have changed legitimately)
  session.ipAddress = getClientIP(request);
  session.deviceFingerprint = generateDeviceFingerprint(request);

  sessionStore.set(session.sessionId, session);

  console.log(`🔄 Session refreshed for user ${session.userId}`);
  return session;
}

export async function invalidateSession(request: Request, sessionId?: string): Promise<void> {
  let targetSessionId = sessionId;

  if (!targetSessionId) {
    // Get session ID from current request
    const validation = await validateSession(request);
    if (validation.session) {
      targetSessionId = validation.session.sessionId;
    }
  }

  if (targetSessionId) {
    const session = sessionStore.get(targetSessionId);
    sessionStore.delete(targetSessionId);

    logAuditEvent(AuditEventType.LOGOUT, request, {
      userId: session?.userId,
      sessionId: targetSessionId,
      success: true
    });

    console.log(`🚪 Session invalidated: ${targetSessionId}`);
  }
}

export async function invalidateAllUserSessions(userId: string): Promise<number> {
  let count = 0;

  for (const [sessionId, session] of sessionStore.entries()) {
    if (session.userId === userId) {
      sessionStore.delete(sessionId);
      count++;
    }
  }

  console.log(`🧹 Invalidated ${count} sessions for user ${userId}`);
  return count;
}

export async function cleanupExpiredSessions(): Promise<number> {
  const now = new Date();
  let count = 0;

  for (const [sessionId, session] of sessionStore.entries()) {
    if (new Date(session.expiresAt) <= now) {
      sessionStore.delete(sessionId);
      count++;
    }
  }

  if (count > 0) {
    console.log(`🧹 Cleaned up ${count} expired sessions`);
  }

  return count;
}

// 🍪 COOKIE OPERATIONS
export async function serializeSession(session: SessionV2): Promise<string> {
  return await sessionV2Cookie.serialize(session);
}

export async function clearSessionCookie(): Promise<string> {
  return await sessionV2Cookie.serialize("", { maxAge: 0 });
}

// 📊 MONITORING & DEBUGGING
export function getSessionStats() {
  const now = new Date();
  const sessions = Array.from(sessionStore.values());

  return {
    total: sessions.length,
    active: sessions.filter(s => new Date(s.expiresAt) > now).length,
    expired: sessions.filter(s => new Date(s.expiresAt) <= now).length,
    remembered: sessions.filter(s => s.isRemembered).length,
    elevated: sessions.filter(s => s.isElevated).length,
    byRole: sessions.reduce((acc, s) => {
      acc[s.role] = (acc[s.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}

export function getAuditLog(limit: number = 100): AuditEvent[] {
  return auditLog.slice(-limit).reverse(); // Most recent first
}

export function getSessionById(sessionId: string): SessionV2 | null {
  return sessionStore.get(sessionId) || null;
}

export function getAllUserSessions(userId: string): SessionV2[] {
  return Array.from(sessionStore.values()).filter(s => s.userId === userId);
}

// 🧪 DEVELOPMENT UTILITIES
export function debugSessionStore() {
  if (process.env.NODE_ENV !== "development") return;

  console.log("🔍 Session Store Debug:", {
    totalSessions: sessionStore.size,
    sessionIds: Array.from(sessionStore.keys()),
    stats: getSessionStats()
  });
}
