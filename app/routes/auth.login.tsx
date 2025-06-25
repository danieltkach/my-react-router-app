import { Form, useNavigation } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getUser, verifyPassword } from "~/lib/auth.server";
import { commitSession, createUserSession, getFlashMessage, setFlashMessage } from "~/lib/session.server";
import { redirect } from "react-router";
import type { Route } from "./+types/auth.login";
import { data } from "react-router";

interface ActionData {
  fieldErrors?: {
    email?: string;
    password?: string;
  };
}

// 🎯 LOADER: Get flash messages and redirect if already logged in
export async function loader({ request }: LoaderFunctionArgs) {
  console.log("🔍 LOADER: Starting");

  const user = await getUser(request);

  if (user) {
    console.log("🔍 LOADER: User already logged in, redirecting");
    throw redirect("/dashboard");
  }

  console.log("🔍 LOADER: Getting flash messages...");
  const { success, error, info, warning, headers } = await getFlashMessage(request);

  console.log("🔍 LOADER: Flash messages:", { success, error, info, warning });
  console.log("🔍 LOADER: Headers:", headers);

  return data({
    flashMessage: {
      success: success || null,
      error: error || null,
      info: info || null,
      warning: warning || null,
    }
  }, {
    headers: {
      "Set-Cookie": headers
    }
  });
}

// 🎯 ACTION: Handle login form submission
export async function action({ request }: ActionFunctionArgs) {
  console.log("🚀 ACTION: Starting");

  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

  console.log("🚀 ACTION: Form data:", { email, password: "***", remember });

  // Validation
  const fieldErrors: ActionData["fieldErrors"] = {};

  if (!email?.includes("@")) {
    fieldErrors.email = "Valid email is required";
  }

  if (!password || password.length < 6) {
    fieldErrors.password = "Password must be at least 6 characters";
  }

  if (Object.keys(fieldErrors).length > 0) {
    console.log("🚀 ACTION: Validation errors:", fieldErrors);
    return { fieldErrors };
  }

  // Auth check
  console.log("🚀 ACTION: Verifying password...");
  const user = await verifyPassword(email, password);

  if (!user) {
    console.log("🚀 ACTION: LOGIN FAILED - Setting flash message");

    // 🆕 Debug: Let's see what setFlashMessage returns
    const session = await setFlashMessage(request, "error", "Invalid email or password");
    console.log("🚀 ACTION: Flash message session:", session);

    const cookieHeader = await commitSession(session);
    console.log("🚀 ACTION: Cookie header:", cookieHeader);

    console.log("🚀 ACTION: Redirecting with flash message");
    return redirect("/auth/login", {
      headers: {
        "Set-Cookie": cookieHeader,
      },
    });
  }

  console.log("🚀 ACTION: LOGIN SUCCESS for user:", user.name);

  // Success flash message
  const session = await setFlashMessage(request, "success", `Welcome back, ${user.name}!`);
  console.log("🚀 ACTION: Success flash message set");

  // Create user session
  return createUserSession({
    request,
    userId: user.id,
    remember,
    redirectTo,
  });
}

export default function AuthLogin({
  loaderData,
  actionData
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // 🔍 Debug: Log what we're getting
  console.log("🎨 COMPONENT: loaderData:", loaderData);
  console.log("🎨 COMPONENT: actionData:", actionData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
            <p className="text-gray-600">Production-Ready Authentication with Flash Messages</p>
          </div>

          {/* 🔍 Debug: Show what flash messages we have */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">🔍 Debug: Flash Messages</h4>
            <div className="text-xs space-y-1">
              <div>Success: {loaderData.flashMessage?.success || "null"}</div>
              <div>Error: {loaderData.flashMessage?.error || "null"}</div>
              <div>Info: {loaderData.flashMessage?.info || "null"}</div>
              <div>Warning: {loaderData.flashMessage?.warning || "null"}</div>
            </div>
          </div>

          {/* Flash Messages Display */}
          {loaderData.flashMessage?.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700">✅ {loaderData.flashMessage.success}</p>
            </div>
          )}

          {loaderData.flashMessage?.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">❌ {loaderData.flashMessage.error}</p>
            </div>
          )}

          {loaderData.flashMessage?.info && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-700">ℹ️ {loaderData.flashMessage.info}</p>
            </div>
          )}

          {loaderData.flashMessage?.warning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-700">⚠️ {loaderData.flashMessage.warning}</p>
            </div>
          )}

          {/* Demo credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-3">🎯 Demo Accounts:</h4>
            <div className="space-y-1 text-sm">
              <div><strong>Admin:</strong> admin@example.com / password</div>
              <div><strong>Manager:</strong> manager@example.com / password</div>
              <div><strong>User:</strong> user@example.com / password</div>
            </div>
          </div>

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
              {actionData?.fieldErrors?.email && (
                <p className="text-red-600 text-sm mt-1">❌ {actionData.fieldErrors.email}</p>
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
                <p className="text-red-600 text-sm mt-1">❌ {actionData.fieldErrors.password}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg transition-all duration-200"
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
        </div>
      </div>
    </div>
  );
}
