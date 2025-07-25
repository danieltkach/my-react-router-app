import { Form, useNavigation } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getCurrentUser, login, createSessionAndRedirect } from "~/lib/auth-v2.server"; // V2 auth imports
import { redirect } from "react-router";
import { Link } from "react-router";
import type { Route } from "./+types/account._public.login"; // Add type import

interface ActionData {
  fieldErrors?: {
    email?: string;
    password?: string;
  };
  formError?: string;
}

// 🎯 Check if already logged in
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request);
  if (user) {
    throw redirect("/account/orders");
  }

  return {
    flashMessage: {
      success: null,
      error: null,
      info: null
    }
  };
}

// 🎯 PRODUCTION: Updated to use new auth system
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";
  const redirectTo = "/account/orders"; // Account users go to orders

  // Validation
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

  // 🎯 NEW: Use V2 auth system
  const result = await login(request, { email, password, remember });

  if (result.success && result.user) {
    return await createSessionAndRedirect(request, result.user, redirectTo);
  } else {
    return { formError: result.error?.message || "Invalid email or password" };
  }
}

// 🎯 UPDATED: Use Route.ComponentProps
export default function AccountLogin({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Sign In to Your Account</h3>

      {/* 🎯 UPDATED: Flash messages */}
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

      {/* Demo credentials */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-800 mb-2">🎯 Production Account Login:</h4>
        <p className="text-blue-700 text-sm mb-2">
          Now uses the same secure session system as the main login!
        </p>
        <p className="text-blue-700 text-sm">
          <strong>Admin:</strong> admin@example.com / password<br />
          <strong>Manager:</strong> manager@example.com / password<br />
          <strong>User:</strong> user@example.com / password
        </p>
      </div>

      {/* Action error display */}
      {actionData?.formError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">❌ {actionData.formError}</p>
        </div>
      )}

      {/* Production form */}
      <Form method="post" className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${actionData?.fieldErrors?.email
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${actionData?.fieldErrors?.password
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

        {/* 🎯 NEW: Remember me option */}
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
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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

      {/* Links to other auth pages */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/account/register" className="text-blue-600 hover:underline">
            Create one
          </Link>
        </p>
        <p className="text-sm text-gray-600">
          Or try the main{' '}
          <Link to="/auth/login" className="text-blue-600 hover:underline">
            login page
          </Link>
        </p>
      </div>
    </div>
  );
}
