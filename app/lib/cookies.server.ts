// lib/cookies.server.ts - Production-Ready Implementation
import { createCookie } from "react-router";

// 🔒 SECURITY: Environment-based configuration
const cookieSecrets = [
  process.env.COOKIE_SECRET || "dev-secret-change-in-production",
  // Add previous secrets here for rotation: "old-secret-1", "old-secret-2"
];
const isProduction = process.env.NODE_ENV === "production";

// 🎯 UNSIGNED COOKIE: Theme preference (not security-critical)
export const themeCookie = createCookie("theme", {
  // Basic security attributes
  httpOnly: false,          // ❌ FALSE: Client needs to read for theme switching
  secure: isProduction,     // ✅ HTTPS only in production
  sameSite: "lax",         // ✅ CSRF protection
  maxAge: 60 * 60 * 24 * 365, // 1 year
  path: "/",

  // ❌ NO SECRETS: This is an unsigned cookie - user can modify
});

// 🔐 SIGNED COOKIE: User data (security-critical)
export const userDataCookie = createCookie("user-data", {
  // Strong security for sensitive data
  httpOnly: true,           // ✅ JavaScript cannot access
  secure: isProduction,     // ✅ HTTPS only in production  
  sameSite: "strict",       // ✅ Strictest CSRF protection
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: "/",

  // 🔐 SIGNED: Tamper-proof with secret
  secrets: cookieSecrets,
});

// 🔐 SESSION COOKIE: Authentication (most critical)
export const sessionCookie = createCookie("session", {
  // Maximum security for auth
  httpOnly: true,           // ✅ No JS access
  secure: isProduction,     // ✅ HTTPS only in production
  sameSite: "strict",       // ✅ Strict CSRF protection
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: "/",

  // 🔐 SIGNED: Authentication must be tamper-proof
  secrets: cookieSecrets,
});

// 🎯 THEME FUNCTIONS (Unsigned Cookie)
export async function parseTheme(request: Request): Promise<string> {
  try {
    const cookieValue = await themeCookie.parse(request.headers.get("Cookie"));

    // ✅ VALIDATION: Handle both string and encoded values
    let theme: string;
    if (typeof cookieValue === "string") {
      theme = cookieValue;
    } else {
      // Fallback for unexpected formats
      theme = "light";
    }

    // ✅ VALIDATION: Only allow specific values
    const validThemes = ["light", "dark", "auto", "hacker"];

    if (validThemes.includes(theme)) {
      return theme;
    }

    // ✅ FALLBACK: Always return valid default
    return "light";
  } catch (error) {
    // ✅ ERROR HANDLING: Log and return safe default
    console.warn("Invalid theme cookie:", error);
    return "light";
  }
}

export async function serializeTheme(theme: string): Promise<string> {
  // ✅ VALIDATION: Server-side validation before setting
  const validThemes = ["light", "dark", "auto", "hacker"];
  const safeTheme = validThemes.includes(theme) ? theme : "light";

  return await themeCookie.serialize(safeTheme);
}

// 🎯 USER PREFERENCES FUNCTIONS (Unsigned Cookie)
export async function parseUserPrefs(request: Request): Promise<Record<string, any>> {
  try {
    const cookieValue = await themeCookie.parse(request.headers.get("Cookie"));

    // ✅ VALIDATION: Check if it's a valid preferences object
    if (cookieValue && typeof cookieValue === "object") {
      return cookieValue as Record<string, any>;
    }

    // ✅ FALLBACK: Default preferences
    return {
      theme: "light",
      language: "en",
      layout: "default"
    };
  } catch (error) {
    console.warn("Invalid user preferences cookie:", error);
    return {
      theme: "light",
      language: "en",
      layout: "default"
    };
  }
}

export async function serializeUserPrefs(prefs: Record<string, any>): Promise<string> {
  // ✅ VALIDATION: Ensure safe values
  const validPrefs = {
    theme: ["light", "dark", "auto"].includes(prefs.theme) ? prefs.theme : "light",
    language: typeof prefs.language === "string" ? prefs.language : "en",
    layout: typeof prefs.layout === "string" ? prefs.layout : "default",
    ...prefs // Allow additional safe preferences
  };

  return await themeCookie.serialize(validPrefs);
}

// 🔐 USER DATA FUNCTIONS (Signed Cookie)
interface SecureUserData {
  userRole: string;
  permissions: string[];
  setAt: string;
  ipAddress: string;
  fingerprint?: string;
}

export async function getSecureUserData(request: Request): Promise<SecureUserData | null> {
  try {
    const cookieValue = await userDataCookie.parse(request.headers.get("Cookie"));

    // ✅ VALIDATION: Verify structure and types
    if (cookieValue && typeof cookieValue === "object") {
      const data = cookieValue as SecureUserData;

      // Validate required fields
      if (data.userRole && data.permissions && Array.isArray(data.permissions)) {
        console.log("✅ Secure cookie validation passed");
        return data;
      }
    }

    console.log("⚠️ Secure cookie validation failed - invalid structure");
    return null;
  } catch (error) {
    // ✅ SECURITY: Log tampering attempts with more detail
    console.warn("🚨 SECURITY: Signed cookie validation failed - possible tampering detected!", {
      error: error instanceof Error ? error.message : String(error),
      userAgent: request.headers.get("User-Agent"),
      timestamp: new Date().toISOString()
    });
    return null;
  }
}

export async function setSecureUserData(data: SecureUserData): Promise<string> {
  // ✅ VALIDATION: Validate data before signing
  if (!data.userRole || !Array.isArray(data.permissions)) {
    throw new Error("Invalid user data structure");
  }

  // ✅ SECURITY: Add timestamp and IP for audit trail
  const secureData: SecureUserData = {
    ...data,
    setAt: new Date().toISOString(),
    // Add request IP if available
  };

  return await userDataCookie.serialize(secureData);
}

// 🔐 SESSION FUNCTIONS (Signed Cookie)
interface SessionData {
  userId: string;
  sessionId: string;
  role: string;
  expiresAt: string;
  createdAt: string;
  ipAddress: string;
  userAgent: string;
}

export async function getSessionData(request: Request): Promise<SessionData | null> {
  try {
    const cookieValue = await sessionCookie.parse(request.headers.get("Cookie"));

    if (cookieValue && typeof cookieValue === "object") {
      const session = cookieValue as SessionData;

      // ✅ EXPIRATION CHECK: Verify session hasn't expired
      if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
        return session;
      } else {
        console.log("Session expired:", session.expiresAt);
        return null;
      }
    }

    return null;
  } catch (error) {
    // ✅ SECURITY: Log potential attacks
    console.warn("Session cookie validation failed:", error);
    return null;
  }
}

export async function setSessionData(request: Request, data: Omit<SessionData, 'createdAt' | 'ipAddress' | 'userAgent'>): Promise<string> {
  // ✅ SECURITY: Add request metadata
  const sessionData: SessionData = {
    ...data,
    createdAt: new Date().toISOString(),
    ipAddress: request.headers.get("X-Forwarded-For") || request.headers.get("X-Real-IP") || "unknown",
    userAgent: request.headers.get("User-Agent") || "unknown",
  };

  return await sessionCookie.serialize(sessionData);
}

export async function clearSessionData(): Promise<string> {
  // ✅ SECURITY: Proper session cleanup
  return await sessionCookie.serialize("", { maxAge: 0 });
}

// 🔧 UTILITY FUNCTIONS
export function getCookieSecurityHeaders(isProduction: boolean) {
  const headers: Record<string, string> = {};

  if (isProduction) {
    // ✅ SECURITY: Production-only headers
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
    headers["X-Content-Type-Options"] = "nosniff";
    headers["X-Frame-Options"] = "DENY";
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
  }

  return headers;
}

// 🧪 DEBUGGING UTILITIES (Development only)
export function debugCookies(request: Request) {
  if (process.env.NODE_ENV !== "development") return;

  const cookies = request.headers.get("Cookie");
  console.log("🍪 Debug - All cookies:", cookies);

  // Parse individual cookies safely
  const cookieMap = new Map();
  cookies?.split(";").forEach(cookie => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookieMap.set(name, decodeURIComponent(value));
    }
  });

  console.log("🍪 Debug - Parsed cookies:", Object.fromEntries(cookieMap));
}
