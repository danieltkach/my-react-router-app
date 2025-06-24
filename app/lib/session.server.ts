import { createCookieSessionStorage, redirect } from "react-router";

// Step 1: Create proper session storage with security
const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "__session", // Standard name
    secrets: ["your-super-secret-key-change-in-production"], // This signs/encrypts cookies
    sameSite: "lax", // CSRF protection
    path: "/", // Available site-wide
    maxAge: 60 * 60 * 24 * 7, // 7 days (in seconds)
    httpOnly: true, // Can't access from JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
  },
});

// Export the session utilities
export { getSession, commitSession, destroySession };

// Helper function to create a new session with user data
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
  const session = await getSession(request.headers.get("Cookie"));

  // Store minimal data in session
  session.set("userId", userId);

  // Adjust session length based on "remember me"
  const maxAge = remember
    ? 60 * 60 * 24 * 30 // 30 days if remember me
    : 60 * 60 * 24 * 7;  // 7 days default

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session, { maxAge }),
    },
  });
}

// Helper function to get user ID from session
export async function getUserId(request: Request): Promise<string | null> {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  return userId || null;
}

// Helper function to logout (destroy session)
export async function logout(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));

  return redirect("/auth/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

// Flash message helpers
export async function setFlashMessage(
  request: Request,
  type: "success" | "error" | "info",
  message: string
) {
  const session = await getSession(request.headers.get("Cookie"));
  session.flash(type, message);
  return session;
}

export async function getFlashMessage(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));

  const success = session.get("success");
  const error = session.get("error");
  const info = session.get("info");

  return {
    success,
    error,
    info,
    // Return the committed session headers as string
    headers: await commitSession(session),
  };
}
