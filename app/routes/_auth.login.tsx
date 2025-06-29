import { Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { getFlashMessages, createFlashMessage, commitSession } from "~/lib/flash-sessions.server";
import { login } from "~/lib/auth-v2.server";
import { redirect } from "react-router";

// Loader to get flash messages
export async function loader({ request }: LoaderFunctionArgs) {
  const flashMessages = await getFlashMessages(request);
  return { flashMessages };
}

// HYBRID ACTION: Real Auth + React Router Flash Messages
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Basic validation
  if (!email || !password) {
    const flashSession = await createFlashMessage(request, "error", "Please fill in all fields");
    return redirect("/auth/login", {
      headers: {
        "Set-Cookie": await commitSession(flashSession),
      },
    });
  }

  try {
    // 🔥 USE REAL AUTH SYSTEM (your production auth-v2.server.ts)
    const authResult = await login(request, { email, password });

    if (authResult.success) {
      // ✅ Success: Use flash message + real auth redirect
      const flashSession = await createFlashMessage(request, "success", "Login successful! Welcome to your secure dashboard.");
      
      // Combine flash message cookie with auth result
      return redirect(authResult.redirectTo || "/dashboard", {
        headers: {
          // Your production auth cookies
          ...authResult.headers,
          // PLUS React Router flash message cookie
          "Set-Cookie": await commitSession(flashSession),
        },
      });
    } else {
      // ❌ Auth failed: Show specific error via flash message
      const errorMessage = authResult.error?.message || "Login failed";
      const flashSession = await createFlashMessage(request, "error", errorMessage);
      
      return redirect("/auth/login", {
        headers: {
          "Set-Cookie": await commitSession(flashSession),
        },
      });
    }
  } catch (error) {
    // 🚨 Unexpected error: Generic flash message
    console.error("Login error:", error);
    const flashSession = await createFlashMessage(request, "error", "An unexpected error occurred. Please try again.");
    
    return redirect("/auth/login", {
      headers: {
        "Set-Cookie": await commitSession(flashSession),
      },
    });
  }
}

export default function Login() {
  const { flashMessages } = useLoaderData<typeof loader>();
  return (
    <form method="post" className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sign In</h2>

      {/* Flash Messages */}
      {flashMessages.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 text-sm">❌ {flashMessages.error}</p>
        </div>
      )}
      
      {flashMessages.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-green-700 text-sm">✅ {flashMessages.success}</p>
        </div>
      )}
      
      {flashMessages.info && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-700 text-sm">ℹ️ {flashMessages.info}</p>
        </div>
      )}
      
      {flashMessages.warning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-700 text-sm">⚠️ {flashMessages.warning}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-600">Remember me</span>
        </label>

        <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
      >
        Sign In
      </button>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
