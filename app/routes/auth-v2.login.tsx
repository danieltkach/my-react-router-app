// routes/auth-v2.login.tsx - Modern Login Page
import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import {
  login,
  getCurrentUser,
  createSessionAndRedirect
} from "~/lib/auth-v2.server";
import type { AuthError } from "~/types/auth-v2";

// 🔍 LOADER: Redirect if already logged in
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request);

  if (user) {
    console.log("🔄 User already logged in, redirecting to dashboard");
    throw redirect("/dashboard");
  }

  // Get redirect URL from search params
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") || "/dashboard";

  return { redirectTo };
}

// 🎯 ACTION: Handle login form submission
export async function action({ request }: ActionFunctionArgs) {
  console.log("🔐 Processing login form...");

  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";
  const redirectTo = formData.get("redirectTo") as string || "/dashboard";

  // Basic validation
  const errors: Record<string, string> = {};

  if (!email || !email.includes("@")) {
    errors.email = "Valid email is required";
  }

  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (Object.keys(errors).length > 0) {
    return {
      fieldErrors: errors,
      formData: { email, remember }
    };
  }

  // Attempt login
  const result = await login(request, { email, password, remember });

  if (result.success && result.user) {
    console.log("✅ Login successful, redirecting to:", redirectTo);
    return await createSessionAndRedirect(request, result.user, redirectTo);
  } else {
    console.log("❌ Login failed:", result.error?.message);
    return {
      authError: result.error,
      fieldErrors: {},
      formData: { email, remember }
    };
  }
}

export default function AuthV2Login() {
  const { redirectTo } = useLoaderData<typeof loader>();
  const actionData = useActionData<{
    authError?: AuthError;
    fieldErrors?: Record<string, string>;
    formData?: { email: string; remember: boolean; };
  }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
            <p className="text-gray-600">Auth V2 - Production Ready Authentication</p>
          </div>

          {/* Demo Banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-green-800 mb-2">🧪 Demo Accounts</h4>
            <div className="space-y-1 text-sm text-green-700">
              <div><strong>Admin:</strong> admin@example.com / password</div>
              <div><strong>Manager:</strong> manager@example.com / password</div>
              <div><strong>User:</strong> user@example.com / password</div>
            </div>
          </div>

          {/* Auth Error Display */}
          {actionData?.authError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 font-medium">❌ {actionData.authError.message}</p>
              {actionData.authError.code === "two_factor_required" && (
                <p className="text-red-600 text-sm mt-2">
                  Two-factor authentication is required for this account.
                </p>
              )}
            </div>
          )}

          {/* Login Form */}
          <Form method="post" className="space-y-6">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                defaultValue={actionData?.formData?.email || ""}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${actionData?.fieldErrors?.email
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300'
                  }`}
                placeholder="admin@example.com"
                required
                disabled={isSubmitting}
              />
              {actionData?.fieldErrors?.email && (
                <p className="text-red-600 text-sm mt-1">❌ {actionData.fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${actionData?.fieldErrors?.password
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300'
                  }`}
                placeholder="password"
                required
                disabled={isSubmitting}
              />
              {actionData?.fieldErrors?.password && (
                <p className="text-red-600 text-sm mt-1">❌ {actionData.fieldErrors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                defaultChecked={actionData?.formData?.remember || false}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg transition-all duration-200"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </Form>

          {/* Features */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">✨ Auth V2 Features</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>🔐 Signed & encrypted session cookies</li>
              <li>🛡️ Role-based access control</li>
              <li>📝 Complete audit logging</li>
              <li>🔄 Session management & rotation</li>
              <li>🧪 Development-friendly testing</li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="mt-6 text-center space-x-4">
            <Link
              to="/auth-v2-demo"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              🧪 View Demo
            </Link>
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
