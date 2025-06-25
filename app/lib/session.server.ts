// app/lib/session.server.ts - Stable system with safe monitoring integration
import { createCookieSessionStorage, redirect } from "react-router";
import crypto from "crypto";
import {
  createSessionRecord,
  logSessionActivity,
  terminateSession,
  getSessionRecord
} from "./session-monitor.server";

type SessionFlashData = {
  error: string;
  success: string;
  warning: string;
  info: string;
};

// Environment-based secrets
const SESSION_SECRETS = process.env.SESSION_SECRETS?.split(',') || [
  'fallback-secret-key-change-in-production-1',
  'fallback-secret-key-change-in-production-2'
];

const SESSION_DEBUG = process.env.NODE_ENV === "development";

function debugLog(message: string, data?: any) {
  if (SESSION_DEBUG) {
    console.log(`🍪 SESSION: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}

// Stable session storage

const { getSession, commitSession, destroySession } = createCookieSessionStorage<
  SessionData,      // Your existing type
  SessionFlashData  // NEW: Flash data type
>({
  cookie: {
    name: "__session",
    secrets: SESSION_SECRETS,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
});

export { getSession, commitSession, destroySession };

// Session data interface
interface SessionData {
  userId: string;
  loginTime: string;
  lastActivity: string;
  remember: boolean;
  sessionId: string;
}

// 🎯 ENHANCED: Create user session with safe monitoring
export async function createUserSession({
  request,
  userId,
  remember = false,
  redirectTo = "/dashboard",
}: {
  request: Request;
  userId: string;
  remember?: boolean;
  redirectTo?: string;
}) {
  debugLog("Creating monitored user session", { userId, remember, redirectTo });

  const session = await getSession(request.headers.get("Cookie"));
  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Store essential session data
  const sessionData: SessionData = {
    userId,
    loginTime: now,
    lastActivity: now,
    remember,
    sessionId
  };

  // Store in cookie session
  Object.entries(sessionData).forEach(([key, value]) => {
    session.set(key as keyof SessionData, value);
  });

  // 🎯 NEW: Create monitoring record (safe - doesn't affect session validity)
  createSessionRecord(sessionId, userId, request, remember);

  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;

  debugLog("Monitored session created", { sessionId, maxAge: `${maxAge / 60 / 60 / 24} days` });

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session, { maxAge }),
    },
  });
}

// 🎯 STABLE: Simple session validation (no complex security checks)
export async function validateSession(request: Request): Promise<SessionData | null> {
  const cookieHeader = request.headers.get("Cookie");

  if (!cookieHeader) {
    debugLog("No cookie header found");
    return null;
  }

  try {
    const session = await getSession(cookieHeader);
    const sessionData = {
      userId: session.get("userId"),
      loginTime: session.get("loginTime"),
      lastActivity: session.get("lastActivity"),
      remember: session.get("remember"),
      sessionId: session.get("sessionId")
    };

    // Only check if essential data exists
    if (!sessionData.userId || !sessionData.sessionId) {
      debugLog("Invalid session data - missing essential fields");
      return null;
    }

    // Only check for very old sessions
    if (sessionData.loginTime) {
      const loginTime = new Date(sessionData.loginTime);
      const maxAge = sessionData.remember
        ? 30 * 24 * 60 * 60 * 1000  // 30 days
        : 7 * 24 * 60 * 60 * 1000;  // 7 days

      if (Date.now() - loginTime.getTime() > maxAge) {
        debugLog("Session too old", {
          loginTime: sessionData.loginTime,
          maxAge: `${maxAge / 1000 / 60 / 60 / 24} days`
        });

        // 🎯 SAFE: Terminate monitoring record but don't log activity (to avoid loops)
        terminateSession(sessionData.sessionId, "expired");
        return null;
      }
    }

    // 🎯 SAFE: Log page access but with throttling to avoid spam
    const shouldLog = Math.random() < 0.3; // Only log 30% of page accesses
    if (shouldLog) {
      logSessionActivity(sessionData.sessionId, "page_access", request);
    }

    debugLog("Session validation successful", {
      userId: sessionData.userId,
      sessionId: sessionData.sessionId
    });

    return sessionData as SessionData;
  } catch (error) {
    debugLog("Session validation error", { error: (error as Error).message }); // 🔧 FIX: Type assertion
    return null;
  }
}

// 🎯 STABLE: Light activity update (optional, safe)
export async function updateSessionActivity(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get("Cookie");

  if (!cookieHeader) {
    return null;
  }

  try {
    const session = await getSession(cookieHeader);
    const userId = session.get("userId");
    const sessionId = session.get("sessionId");

    if (!userId || !sessionId) {
      return null;
    }

    // Simply update activity time
    session.set("lastActivity", new Date().toISOString());

    // 🎯 SAFE: Log activity update occasionally
    const shouldLog = Math.random() < 0.1; // Only log 10% of activity updates
    if (shouldLog) {
      logSessionActivity(sessionId, "activity_update", request);
    }

    const newCookieHeader = await commitSession(session); // 🔧 FIX: Rename to avoid conflict
    return newCookieHeader;
  } catch (error) {
    debugLog("Failed to update session activity", { error: (error as Error).message }); // 🔧 FIX: Type assertion
    return null;
  }
}

// 🎯 STABLE: Get user ID
export async function getUserId(request: Request): Promise<string | null> {
  const sessionData = await validateSession(request);
  return sessionData?.userId || null;
}

// 🎯 ENHANCED: Logout with monitoring
export async function logout(request: Request) {
  const sessionData = await validateSession(request);

  if (sessionData) {
    debugLog("Logging out user", {
      userId: sessionData.userId,
      sessionId: sessionData.sessionId
    });

    // 🎯 SAFE: Log logout and terminate monitoring
    logSessionActivity(sessionData.sessionId, "logout", request);
    terminateSession(sessionData.sessionId, "user_logout");
  }

  const session = await getSession(request.headers.get("Cookie"));

  return redirect("/auth/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

// 🎯 ENHANCED: Session inspection with monitoring data
export async function inspectSession(request: Request) {
  const cookieHeader = request.headers.get("Cookie");

  if (!cookieHeader) {
    return {
      hasSession: false,
      cookies: null,
      sessionData: null,
      securityInfo: null,
      monitoringData: null
    };
  }

  try {
    const sessionData = await validateSession(request);

    if (!sessionData) {
      return {
        hasSession: true,
        cookies: cookieHeader,
        sessionData: null,
        securityInfo: { valid: false, reason: "Validation failed" },
        monitoringData: null
      };
    }

    // 🎯 SAFE: Get monitoring data
    const monitoringRecord = getSessionRecord(sessionData.sessionId);

    const loginTime = new Date(sessionData.loginTime);
    const lastActivity = new Date(sessionData.lastActivity);

    return {
      hasSession: true,
      cookies: cookieHeader,
      sessionData,
      securityInfo: {
        valid: true,
        sessionAge: `${Math.round((Date.now() - loginTime.getTime()) / 1000 / 60 / 60)} hours`,
        lastActivity: `${Math.round((Date.now() - lastActivity.getTime()) / 1000 / 60)} minutes ago`
      },
      monitoringData: monitoringRecord ? {
        totalActivities: monitoringRecord.activities.length,
        recentActivities: monitoringRecord.activities.slice(-10), // Last 10 activities
        deviceInfo: monitoringRecord.deviceInfo,
        loginIP: monitoringRecord.loginIP,
        isActive: monitoringRecord.isActive
      } : null
    };
  } catch (error) {
    return {
      hasSession: true,
      cookies: cookieHeader,
      sessionData: null,
      securityInfo: { valid: false, reason: (error instanceof Error ? error.message : String(error)) },
      monitoringData: null
    };
  }
}

// 🎯 ACTIVITY HELPERS: Safe logging functions for specific actions
export async function logCartActivity(request: Request, action: string, details: any) {
  const sessionData = await validateSession(request);
  if (sessionData) {
    logSessionActivity(sessionData.sessionId, `cart_${action}`, request, details);
  }
}

export async function logAuthActivity(request: Request, action: string, details: any) {
  const sessionData = await validateSession(request);
  if (sessionData) {
    logSessionActivity(sessionData.sessionId, `auth_${action}`, request, details);
  }
}

export async function logShopActivity(request: Request, action: string, details: any) {
  const sessionData = await validateSession(request);
  if (sessionData) {
    logSessionActivity(sessionData.sessionId, `shop_${action}`, request, details);
  }
}

export async function setFlashMessage(
  request: Request,
  type: "success" | "error" | "info" | "warning",
  message: string
) {
  const session = await getSession(request.headers.get("Cookie"));
  session.flash(type, message);
  return session;
}

export async function getFlashMessage(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));

  return {
    success: session.get("success"),
    error: session.get("error"),
    info: session.get("info"),
    warning: session.get("warning"),
    headers: await commitSession(session),
  };
}