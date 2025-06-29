// lib/session.server.ts - Gradual Migration (Keep Old + Add New)
import { redirect } from "react-router";
import { sessionCookie } from "./cookies.server";

// 🔄 KEEP OLD INTERFACES (for backward compatibility)
export interface Session {
  userId: string;
  role: string;
  expiresAt: Date;
}

// 🎯 NEW ENHANCED INTERFACE
export interface EnhancedSessionData {
  userId: string;
  sessionId: string;
  role: "admin" | "manager" | "user";
  permissions: string[];
  department?: string;
  cartId: string;              // 🔒 SECURITY: Signed cart reference
  createdAt: string;
  expiresAt: string;
  lastActivity: string;
  ipAddress: string;
  userAgent: string;
  isRemembered: boolean;
}

// 🔧 UTILITY FUNCTIONS
function generateSessionId(): string {
  return `sess-${Date.now()}-${Math.random().toString(36).substring(2)}`;
}

function generateCartId(userId: string, sessionId: string): string {
  const sessionSuffix = sessionId.split('-')[1] || Math.random().toString(36).substring(2);
  return `cart-${userId}-${sessionSuffix}`;
}

// ======================================
// 🔄 OLD FUNCTIONS (KEEP FOR COMPATIBILITY)
// ======================================

// 🔄 OLD: Simple session validation (keep for auth.server.ts)
export async function validateSession(request: Request): Promise<Session | null> {
  console.warn("🚨 MIGRATION: Using old validateSession - consider upgrading");

  try {
    const cookieValue = await sessionCookie.parse(request.headers.get("Cookie"));

    if (cookieValue && typeof cookieValue === "object") {
      const session = cookieValue as any;

      // Handle both old and new session formats
      if (session.userId) {
        return {
          userId: session.userId,
          role: session.role || "user",
          expiresAt: session.expiresAt ? new Date(session.expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
      }
    }

    return null;
  } catch (error) {
    console.warn("Session validation failed:", error);
    return null;
  }
}

// 🔄 OLD: Create session (keep for existing routes)
export async function createSession(userId: string, role: string = "user"): Promise<string> {
  console.warn("🚨 MIGRATION: Using old createSession - consider upgrading to createUserSession");

  // Create enhanced session but return old format cookie
  const sessionData = {
    userId,
    sessionId: generateSessionId(),
    role: role as "admin" | "manager" | "user",
    permissions: role === "admin" ? ["read", "write", "delete", "admin"] : ["read"],
    cartId: generateCartId(userId, generateSessionId()),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date().toISOString(),
    isRemembered: false
  };

  // Use new secure cookie system internally
  return await sessionCookie.serialize(sessionData);
}

// 🔄 OLD: Commit session (keep for existing code)
export async function commitSession(session: any): Promise<string> {
  console.warn("🚨 MIGRATION: Using old commitSession - consider direct cookie usage");
  return await sessionCookie.serialize(session);
}

// 🔄 OLD: Get session (keep for existing code)
export async function getSession(request: Request): Promise<any> {
  console.warn("🚨 MIGRATION: Using old getSession - consider getUser or getEnhancedSessionData");
  return await validateSession(request);
}

// ======================================
// 🎯 NEW ENHANCED FUNCTIONS
// ======================================

// 🔐 NEW: Enhanced session data management
export async function getEnhancedSessionData(request: Request): Promise<EnhancedSessionData | null> {
  try {
    const cookieValue = await sessionCookie.parse(request.headers.get("Cookie"));

    if (cookieValue && typeof cookieValue === "object") {
      const session = cookieValue as EnhancedSessionData;

      // ✅ EXPIRATION CHECK: Verify session hasn't expired
      if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
        console.log("✅ Enhanced session found for user:", session.userId);
        return session;
      } else {
        console.log("⏰ Enhanced session expired:", session.expiresAt);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.warn("🚨 Enhanced session validation failed:", error);
    return null;
  }
}

// 🔐 NEW: Set enhanced session data
export async function setEnhancedSessionData(request: Request, data: Omit<EnhancedSessionData, 'createdAt' | 'ipAddress' | 'userAgent'>): Promise<string> {
  const sessionData: EnhancedSessionData = {
    ...data,
    createdAt: new Date().toISOString(),
    ipAddress: request.headers.get("X-Forwarded-For") || request.headers.get("X-Real-IP") || "unknown",
    userAgent: request.headers.get("User-Agent") || "unknown",
  };

  console.log("🔐 Creating enhanced session for user:", sessionData.userId);
  return await sessionCookie.serialize(sessionData);
}

// 🔐 NEW: Clear session data
export async function clearEnhancedSessionData(): Promise<string> {
  console.log("🧹 Clearing enhanced session");
  return await sessionCookie.serialize("", { maxAge: 0 });
}

// 🎯 NEW: Create user session (enhanced version)
export async function createUserSession({
  request,
  userId,
  role = "user",
  permissions = [],
  department,
  remember = false,
  redirectTo = "/dashboard"
}: {
  request: Request;
  userId: string;
  role?: "admin" | "manager" | "user";
  permissions?: string[];
  department?: string;
  remember?: boolean;
  redirectTo?: string;
}) {
  const sessionId = generateSessionId();
  const cartId = generateCartId(userId, sessionId);

  const sessionData: Omit<EnhancedSessionData, 'createdAt' | 'ipAddress' | 'userAgent'> = {
    userId,
    sessionId,
    role,
    permissions: permissions.length > 0 ? permissions : (role === "admin" ? ["read", "write", "delete", "admin"] : ["read"]),
    department,
    cartId,
    expiresAt: new Date(Date.now() + (remember ? 30 : 1) * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date().toISOString(),
    isRemembered: remember
  };

  const sessionCookieValue = await setEnhancedSessionData(request, sessionData);

  const headers = new Headers();
  headers.append("Set-Cookie", sessionCookieValue);

  if (process.env.NODE_ENV === "production") {
    headers.append("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  console.log("✅ Enhanced user session created, redirecting to:", redirectTo);
  return redirect(redirectTo, { headers });
}

// 🎯 NEW: Get current user (enhanced version)
export async function getUser(request: Request) {
  // Try enhanced session first
  const enhancedSession = await getEnhancedSessionData(request);
  if (enhancedSession) {
    return {
      id: enhancedSession.userId,
      name: `User ${enhancedSession.userId}`, // TODO: Get from database
      email: `user${enhancedSession.userId}@example.com`, // TODO: Get from database
      role: enhancedSession.role,
      permissions: enhancedSession.permissions,
      department: enhancedSession.department
    };
  }

  // Fallback to old session format
  const oldSession = await validateSession(request);
  if (oldSession) {
    return {
      id: oldSession.userId,
      name: `User ${oldSession.userId}`,
      email: `user${oldSession.userId}@example.com`,
      role: oldSession.role,
      permissions: oldSession.role === "admin" ? ["read", "write", "delete", "admin"] : ["read"],
      department: undefined
    };
  }

  return null;
}

// 🎯 NEW: Require authentication
export async function requireUser(request: Request) {
  const user = await getUser(request);

  if (!user) {
    console.log("🚫 Authentication required, redirecting to login");
    throw redirect("/auth/login");
  }

  return user;
}

// 🎯 NEW: Get secure cart (fixes security vulnerability)
export async function getUserCart(user: any, request?: Request) {
  const enhancedSession = request ? await getEnhancedSessionData(request) : null;

  if (enhancedSession) {
    // 🔒 SECURITY: Cart ID from signed session
    console.log("🛒 Getting cart for user:", user.id, "cartId:", enhancedSession.cartId);
    return {
      id: enhancedSession.cartId,
      itemCount: 0, // TODO: Get from database
      total: 0,     // TODO: Get from database
      items: []     // TODO: Get from database
    };
  }

  // Fallback for old sessions
  return {
    id: `cart-${user.id}`,
    itemCount: 0,
    total: 0,
    items: []
  };
}

// 🎯 NEW: Enhanced logout
export async function logout(request: Request) {
  const session = await getEnhancedSessionData(request);

  if (session) {
    console.log("🚪 Logging out user:", session.userId);
  }

  const clearedCookie = await clearEnhancedSessionData();

  const headers = new Headers();
  headers.append("Set-Cookie", clearedCookie);

  return redirect("/auth/login", { headers });
}

// 🎯 NEW: Role-based access control
export async function requireRole(request: Request, allowedRoles: string[]) {
  const user = await requireUser(request);

  if (!allowedRoles.includes(user.role)) {
    console.log("🚫 Access denied. Required roles:", allowedRoles, "User role:", user.role);
    throw new Response("Forbidden", { status: 403 });
  }

  return user;
}

// 🎯 NEW: Permission-based access control  
export async function requirePermission(request: Request, permission: string) {
  const user = await requireUser(request);

  if (!user.permissions.includes(permission)) {
    console.log("🚫 Access denied. Required permission:", permission, "User permissions:", user.permissions);
    throw new Response("Forbidden", { status: 403 });
  }

  return user;
}

// 🧪 DEBUGGING: Session inspection
export async function debugSession(request: Request) {
  if (process.env.NODE_ENV !== "development") return;

  const enhancedSession = await getEnhancedSessionData(request);
  const oldSession = await validateSession(request);

  console.log("🔍 Session Debug:", {
    hasEnhancedSession: !!enhancedSession,
    hasOldSession: !!oldSession,
    userId: enhancedSession?.userId || oldSession?.userId,
    role: enhancedSession?.role || oldSession?.role,
    cartId: enhancedSession?.cartId,
    permissions: enhancedSession?.permissions
  });
}

// ======================================
// 🔄 MIGRATION ALIASES (for gradual transition)
// ======================================

// Keep old function names working
export const getSessionData = getEnhancedSessionData;
export const setSessionData = setEnhancedSessionData;
export const clearSessionData = clearEnhancedSessionData;
export const createEnhancedUserSession = createUserSession;
export const getEnhancedUser = getUser;
export const enhancedLogout = logout;
export const requireEnhancedUser = requireUser;

// Add this function to your existing lib/session.server.ts file

export async function inspectSession(request: Request) {
  console.warn("🚨 MIGRATION: Using old inspectSession - consider upgrading to auth-v2");

  // Simple implementation to make it work
  const session = await validateSession(request);

  return {
    sessionData: session ? {
      sessionId: "legacy-session",
      userId: session.userId,
      role: session.role
    } : null,
    securityInfo: {
      valid: !!session
    }
  };
}

// Complete compatibility layer - add to your lib/session.server.ts

// ======================================
// 🔄 COMPATIBILITY LAYER FOR OLD ROUTES
// ======================================

export async function getFlashMessage(request: Request) {
  console.warn("🚨 MIGRATION: Using old getFlashMessage");
  const url = new URL(request.url);
  return {
    success: url.searchParams.get("success") || null,
    error: url.searchParams.get("error") || null,
    info: url.searchParams.get("info") || null,
    warning: url.searchParams.get("warning") || null,
    headers: ""
  };
}

export async function setFlashMessage(request: Request, type: string, message: string) {
  console.warn("🚨 MIGRATION: Using old setFlashMessage");
  return { flash: { [type]: message } };
}

// Add any other missing functions that show up...
