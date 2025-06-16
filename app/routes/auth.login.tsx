// app/routes/auth.login.tsx - COMPLETE FIXED VERSION
import { Form, useActionData, useNavigation, redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { createSession, getUser } from "~/lib/auth.server";

interface ActionData {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
}

// 🎯 Teaching Point: Loader redirects authenticated users
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (user) {
    throw redirect("/dashboard");
  }
  return {};
}

// 🎯 Teaching Point: Action processes login form with type-safe validation
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 🎯 Direct validation - cleaner and type-safe
  const fieldErrors: ActionData["fieldErrors"] = {};

  if (!email?.includes("@")) {
    fieldErrors.email = "Valid email is required";
  }

  if (!password || password.length < 6) {
    fieldErrors.password = "Password must be at least 6 characters";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  // Use our professional auth utility
  const sessionCookie = await createSession(email, password);

  if (sessionCookie) {
    // 🎯 Teaching Point: Set cookie and redirect
    const headers = new Headers();
    headers.append("Set-Cookie", sessionCookie);
    throw redirect("/dashboard", { headers });
  }

  return { error: "Invalid credentials. Try demo accounts: admin@example.com, manager@example.com, user@example.com" };
}

export default function AuthLogin() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Login</h1>
            <p className="text-gray-600">Part 5: Working Form Actions</p>
          </div>

          {/* 🎯 Teaching Point: Demo credentials with working actions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-3">🎯 Real Working Login:</h4>
            <p className="text-blue-700 text-sm mb-3">
              This form now has REAL server-side processing, validation, and session management!
            </p>
            <div className="space-y-1 text-sm">
              <div><strong>Admin:</strong> admin@example.com / password</div>
              <div><strong>Manager:</strong> manager@example.com / password</div>
              <div><strong>User:</strong> user@example.com / password</div>
            </div>
          </div>

          {/* Server Error Display */}
          {actionData?.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">❌ {actionData.error}</p>
            </div>
          )}

          {/* Form with Real Server Action */}
          <Form method="post" className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${actionData?.fieldErrors?.email
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300'
                  }`}
                placeholder="admin@example.com"
                required
              />
              {/* Field-Specific Error Display */}
              {actionData?.fieldErrors?.email && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  ❌ {actionData.fieldErrors.email}
                </p>
              )}
            </div>

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
              />
              {actionData?.fieldErrors?.password && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  ❌ {actionData.fieldErrors.password}
                </p>
              )}
            </div>

            {/* Professional Loading State Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

          <div className="mt-6 text-center">
            <a href="/test-auth" className="text-sm text-gray-600 hover:text-gray-800">
              ← Test Auth System
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}