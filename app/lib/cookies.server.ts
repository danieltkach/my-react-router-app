// app/lib/cookies.server.ts - Following React Router docs exactly
import { createCookie } from "react-router";

// 🎯 1. USER PREFERENCES COOKIE (exact docs example)
export const userPrefs = createCookie("user-prefs", {
  maxAge: 604_800, // one week (exact docs value)
  path: "/",
  sameSite: "lax",
  httpOnly: false, // Allow client-side access for theme switching
  secure: process.env.NODE_ENV === "production",
});

// 🎯 2. BANNER DISMISSAL COOKIE (from docs example - our main focus)
export const bannerPrefs = createCookie("banner-prefs", {
  maxAge: 604_800, // one week
  path: "/",
  sameSite: "lax",
  httpOnly: true, // Server-only for security
  secure: process.env.NODE_ENV === "production",
});

// 🎯 3. SIGNED COOKIE for sensitive data (docs example)
export const secureUserData = createCookie("secure-user-data", {
  secrets: process.env.COOKIE_SECRETS?.split(',') || [
    "n3wsecr3t",
    "olds3cret"
  ], // Secret rotation support from docs
  maxAge: 60 * 60 * 24, // 1 day
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict", // More strict for sensitive data
});

// 🎯 4. THEME PREFERENCE COOKIE (practical example)
export const themeCookie = createCookie("theme", {
  maxAge: 604_800, // one week
  path: "/",
  sameSite: "lax",
  httpOnly: false, // Allow client-side theme switching
  secure: process.env.NODE_ENV === "production",
});

// 🎯 5. COOKIE UTILITIES (following docs patterns)

// Parse banner preferences safely with defaults
export async function parseBannerPrefs(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  return (await bannerPrefs.parse(cookieHeader)) || {
    salesBannerDismissed: false,
    newsletterBannerDismissed: false,
    cookieBannerAccepted: false,
    lastDismissedDate: null,
  };
}

// Parse user preferences safely with defaults  
export async function parseUserPrefs(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  return (await userPrefs.parse(cookieHeader)) || {
    theme: "light",
    language: "en",
    layout: "grid",
    itemsPerPage: 12,
    showBanner: true, // This is the key field from docs example
  };
}

// Parse theme preference
export async function parseTheme(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  return (await themeCookie.parse(cookieHeader)) || "light";
}

// 🎯 6. COOKIE SERIALIZATION HELPERS (docs pattern)

export async function serializeBannerPrefs(prefs: any) {
  return bannerPrefs.serialize(prefs);
}

export async function serializeUserPrefs(prefs: any, options?: any) {
  return userPrefs.serialize(prefs, options);
}

export async function serializeTheme(theme: string) {
  return themeCookie.serialize(theme);
}

// 🎯 7. SECURE DATA HELPERS (using signed cookies from docs)

export async function setSecureUserData(data: any) {
  return secureUserData.serialize(data);
}

export async function getSecureUserData(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  try {
    return await secureUserData.parse(cookieHeader);
  } catch (error) {
    // Cookie was tampered with or signed with old secret
    console.warn("Invalid secure cookie signature");
    return null;
  }
}

// 🎯 8. BANNER SPECIFIC HELPERS (for our main example)

export async function isBannerDismissed(request: Request, bannerType: string) {
  const prefs = await parseBannerPrefs(request);
  return prefs[`${bannerType}BannerDismissed`] || false;
}

export async function dismissBanner(request: Request, bannerType: string) {
  const prefs = await parseBannerPrefs(request);
  prefs[`${bannerType}BannerDismissed`] = true;
  prefs.lastDismissedDate = new Date().toISOString();

  return bannerPrefs.serialize(prefs);
}
