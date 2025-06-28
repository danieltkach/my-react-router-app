// app/routes/cookie-demo.tsx - Fixed Implementation
import { Form, Link } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import {
  parseTheme,
  serializeTheme,
  getSecureUserData,
  setSecureUserData,
  getCookieSecurityHeaders,
  debugCookies,
  userDataCookie
} from "~/lib/cookies.server";
import type { Route } from "./+types/cookie-demo";

// 🎯 LOADER - Safely parse all cookie types
export async function loader({ request }: LoaderFunctionArgs) {
  // 🧪 DEBUG: Only in development
  debugCookies(request);

  // ✅ SAFE PARSING: All functions include error handling
  const theme = await parseTheme(request);
  const secureData = await getSecureUserData(request);

  return {
    theme,
    secureData,
    timestamp: new Date().toLocaleString(),
    // 🔧 DEBUGGING: Show cookie parsing details
    debugInfo: {
      rawCookies: request.headers.get("Cookie") || "No cookies found",
      hasSecureData: !!secureData,
      themeIsValid: ["light", "dark", "auto", "hacker"].includes(theme)
    }
  };
}

// 🎯 ACTION - Handle both cookie types with validation
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action") as string;

  const headers = new Headers();

  // ✅ SECURITY: Add security headers
  const securityHeaders = getCookieSecurityHeaders(process.env.NODE_ENV === "production");
  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  try {
    if (action === "set-theme") {
      const newTheme = formData.get("theme") as string;

      // ✅ VALIDATION: Server-side validation
      const validThemes = ["light", "dark", "auto", "hacker"];
      if (!validThemes.includes(newTheme)) {
        throw new Error(`Invalid theme: ${newTheme}`);
      }

      // ✅ UNSIGNED COOKIE: Theme (not security-critical)
      const themeCookie = await serializeTheme(newTheme);
      headers.append("Set-Cookie", themeCookie);

      console.log(`✅ Theme set to: ${newTheme}`);
    }

    if (action === "set-secure-data") {
      const userRole = formData.get("userRole") as string;
      const permissions = formData.get("permissions") as string;

      // ✅ VALIDATION: Validate input
      const validRoles = ["admin", "manager", "user", "guest"];
      if (!validRoles.includes(userRole)) {
        throw new Error(`Invalid role: ${userRole}`);
      }

      // 🔐 SIGNED COOKIE: Sensitive data (security-critical)
      const secureData = {
        userRole,
        permissions: permissions.split(",").map(p => p.trim()).filter(Boolean),
        setAt: new Date().toISOString(),
        ipAddress: request.headers.get("X-Forwarded-For") || "unknown"
      };

      const secureCookie = await setSecureUserData(secureData);
      headers.append("Set-Cookie", secureCookie);

      console.log(`🔐 Secure data set for role: ${userRole}`);
    }

    if (action === "clear-all") {
      // ✅ PROPER CLEANUP: Clear both cookie types properly
      const clearedTheme = await serializeTheme("light"); // Reset to default

      // Clear secure cookie by setting it to expire immediately
      const clearedSecure = await userDataCookie.serialize("", { maxAge: 0 });

      headers.append("Set-Cookie", clearedTheme);
      headers.append("Set-Cookie", clearedSecure);

      console.log("🧹 All cookies cleared");
    }

  } catch (error) {
    // ✅ ERROR HANDLING: Log and continue
    console.error("Cookie action error:", error);

    // ✅ TYPESCRIPT: Handle unknown error type
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    // Don't crash - redirect with error in URL params
    return redirect("/cookie-demo?error=" + encodeURIComponent(errorMessage), { headers });
  }

  return redirect("/cookie-demo", { headers });
}

export default function CookieDemo({ loaderData }: Route.ComponentProps) {
  const { theme, secureData, timestamp, debugInfo } = loaderData;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        🍪 Production-Ready Cookie Demo
      </h1>

      {/* ✅ ERROR FIXED: Educational banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h2 className="text-green-800 font-semibold mb-2">
          ✅ Error Fixed + Production Features Added!
        </h2>
        <div className="text-green-700 text-sm space-y-2">
          <p><strong>🐛 Bug Fix:</strong> Added proper validation - no more "Objects are not valid as a React child"</p>
          <p><strong>🔒 Security:</strong> httpOnly, secure, sameSite attributes configured</p>
          <p><strong>🔐 Signed Cookies:</strong> Tamper-proof with cryptographic signatures</p>
          <p><strong>⚡ Error Handling:</strong> Graceful fallbacks for invalid data</p>
          <p><strong>🛡️ Validation:</strong> Server-side input validation and sanitization</p>
        </div>
      </div>

      {/* 🧪 DEBUG PANEL */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-blue-800 font-semibold mb-2">🔍 Debug Information</h3>
        <div className="text-blue-700 text-sm space-y-1">
          <p><strong>Raw Cookies:</strong> <code className="bg-blue-100 px-2 py-1 rounded text-xs">{debugInfo.rawCookies}</code></p>
          <p><strong>Theme Valid:</strong> {debugInfo.themeIsValid ? "✅ Yes" : "❌ No"}</p>
          <p><strong>Has Secure Data:</strong> {debugInfo.hasSecureData ? "✅ Yes" : "❌ No"}</p>
          <p><strong>Timestamp:</strong> {timestamp}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ✅ UNSIGNED COOKIE DEMO */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            ✅ Unsigned Cookie: Theme Preference
          </h2>

          <div className="mb-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600 mb-2">Current theme:</p>
            <p className="font-mono text-lg font-bold text-green-600">{theme}</p>
            <p className="text-xs text-gray-500 mt-2">
              ✅ This value is validated and safe to display
            </p>
          </div>

          <Form method="post" className="space-y-4">
            <input type="hidden" name="action" value="set-theme" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Theme:
              </label>
              <select
                name="theme"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                defaultValue={theme}
              >
                <option value="light">🌞 Light Mode</option>
                <option value="dark">🌙 Dark Mode</option>
                <option value="auto">🤖 Auto Mode</option>
                <option value="hacker">💻 Hacker Mode</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Set Theme (Unsigned Cookie)
            </button>
          </Form>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 text-sm">
              <strong>⚠️ Security Note:</strong> Users can modify this cookie, but we validate it server-side.
              Try editing it in DevTools - the app won't crash now!
            </p>
          </div>
        </div>

        {/* 🔐 SIGNED COOKIE DEMO */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            🔐 Signed Cookie: Secure User Data
          </h2>

          <div className="mb-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600 mb-2">Current secure data:</p>
            {secureData ? (
              <div className="font-mono text-sm space-y-1">
                <p><strong>Role:</strong> <span className="text-green-600">{secureData.userRole}</span></p>
                <p><strong>Permissions:</strong> <span className="text-blue-600">{secureData.permissions?.join(", ")}</span></p>
                <p><strong>Set at:</strong> <span className="text-gray-600">{secureData.setAt}</span></p>
                <p><strong>IP:</strong> <span className="text-purple-600">{secureData.ipAddress}</span></p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No secure data set</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              🔐 This data is cryptographically signed and tamper-proof
            </p>
          </div>

          <Form method="post" className="space-y-4">
            <input type="hidden" name="action" value="set-secure-data" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role:
              </label>
              <select
                name="userRole"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="admin">👑 Admin</option>
                <option value="manager">🎯 Manager</option>
                <option value="user">👤 User</option>
                <option value="guest">🚶 Guest</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions (comma-separated):
              </label>
              <input
                type="text"
                name="permissions"
                placeholder="read,write,delete"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                defaultValue="read,write"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              Set Secure Data (Signed Cookie)
            </button>
          </Form>

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 text-sm">
              <strong>🔒 Security Note:</strong> This cookie is cryptographically signed.
              Try modifying it in DevTools - it will be rejected and cleared!
            </p>
          </div>
        </div>
      </div>

      {/* 🧪 TESTING SECTION */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          🧪 Security Testing
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">🧪 Test Unsigned Cookie:</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Set a theme above</li>
              <li>Open DevTools → Application → Cookies</li>
              <li>Change "theme" value to "invalid-theme"</li>
              <li>Refresh → Should default to "light" (no crash!)</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">🔐 Test Signed Cookie:</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Set secure data above</li>
              <li>In DevTools, modify "user-data" cookie</li>
              <li>Refresh → Data disappears (signature invalid!)</li>
              <li>Check console for security warnings</li>
            </ol>
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <Form method="post" className="inline">
            <input type="hidden" name="action" value="clear-all" />
            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              🧹 Clear All Cookies
            </button>
          </Form>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 text-center">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}