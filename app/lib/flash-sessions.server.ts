// Flash Session Storage - Official React Router Implementation
// This file demonstrates React Router's official session storage patterns
// Used for flash messages and temporary UI state alongside our advanced auth system

import { createCookieSessionStorage } from "react-router";

// Define session data types
type SessionData = {
  userId?: string; // Basic user identification
};

// Define flash message types  
type FlashData = {
  error?: string;
  success?: string;
  info?: string;
  warning?: string;
};

// Create official React Router session storage
const { getSession, commitSession, destroySession } = 
  createCookieSessionStorage<SessionData, FlashData>({
    cookie: {
      name: "__flash_session",
      secrets: [process.env.SESSION_SECRET || "dev-secret-change-in-production"],
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    },
  });

// Helper functions for flash messages
export async function getFlashSession(request: Request) {
  return await getSession(request.headers.get("Cookie"));
}

export async function createFlashMessage(
  request: Request, 
  type: keyof FlashData, 
  message: string
) {
  const session = await getFlashSession(request);
  session.flash(type, message);
  return session;
}

export async function getFlashMessages(request: Request) {
  const session = await getFlashSession(request);
  
  return {
    error: session.get("error"),
    success: session.get("success"), 
    info: session.get("info"),
    warning: session.get("warning"),
  };
}

// Export the official React Router session functions
export { getSession, commitSession, destroySession };