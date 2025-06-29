// routes/auth-v2-demo.tsx - Simple Auth V2 Demo
import { Link, Form, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import {
  getCurrentUser,
  quickLogin,
  logout,
  requireRole,
  requirePermission,
  hasRole,
  hasPermission,
  getSessionInfo
} from "~/lib/auth-v2.server";
import { UserRole, Permission } from "~/types/auth-v2";

// 🔍 LOADER: Demonstrate different auth checks
export async function loader({ request }: LoaderFunctionArgs) {
  console.log("🔍 Auth V2 Demo - Loading...");

  // 1. Simple user check (doesn't throw)
  const user = await getCurrentUser(request);

  // 2. Boolean permission checks (doesn't throw)
  const canManageUsers = await hasPermission(request, Permission.MANAGE_USERS);
  const canViewAnalytics = await hasPermission(request, Permission.VIEW_ANALYTICS);
  const isAdmin = await hasRole(request, UserRole.ADMIN);
  const isManager = await hasRole(request, UserRole.MANAGER);

  // 3. Get detailed session info for debugging
  const sessionInfo = await getSessionInfo(request);

  console.log("🔍 Auth V2 Demo - Loaded:", {
    hasUser: !!user,
    userRole: user?.role,
    canManageUsers,
    isAdmin
  });

  return {
    user,
    permissions: {
      canManageUsers,
      canViewAnalytics,
      isAdmin,
      isManager
    },
    sessionInfo,
    timestamp: new Date().toLocaleString()
  };
}

// 🎯 ACTION: Demonstrate login/logout actions
export async function action({ request }: ActionFunctionArgs) {
  console.log("🎯 Auth V2 Demo - Action...");

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  switch (intent) {
    case "quick-login-admin":
      console.log("🧪 Quick login as admin");
      return await quickLogin(request, "admin");

    case "quick-login-manager":
      console.log("🧪 Quick login as manager");
      return await quickLogin(request, "manager");

    case "quick-login-user":
      console.log("🧪 Quick login as user");
      return await quickLogin(request, "user");

    case "logout":
      console.log("🚪 Logging out");
      return await logout(request, "/auth-v2-demo");

    case "test-require-admin":
      console.log("🔒 Testing admin requirement");
      try {
        await requireRole(request, UserRole.ADMIN);
        return { success: "Admin access granted!" };
      } catch (error) {
        return { error: "Admin access denied!" };
      }

    case "test-require-manage-users":
      console.log("🔐 Testing manage users permission");
      try {
        await requirePermission(request, Permission.MANAGE_USERS);
        return { success: "Manage users permission granted!" };
      } catch (error) {
        return { error: "Manage users permission denied!" };
      }

    default:
      return { error: "Unknown action" };
  }
}

export default function AuthV2Demo() {
  const { user, permissions, sessionInfo, timestamp } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        🧪 Auth V2 System Demo
      </h1>

      {/* Current Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-blue-800 font-semibold mb-2">Current Authentication Status</h2>
        <div className="text-blue-700">
          <p><strong>Logged in:</strong> {user ? "✅ Yes" : "❌ No"}</p>
          {user && (
            <>
              <p><strong>User:</strong> {user.name} ({user.email})</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Permissions:</strong> {user.permissions.map(p => Permission[p]).join(", ")}</p>
            </>
          )}
          <p><strong>Loaded at:</strong> {timestamp}</p>
        </div>
      </div>

      {/* Quick Login Buttons */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h2 className="text-green-800 font-semibold mb-4">🧪 Quick Login (Development Only)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form method="post">
            <input type="hidden" name="intent" value="quick-login-admin" />
            <button className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">
              👑 Login as Admin
            </button>
          </Form>

          <Form method="post">
            <input type="hidden" name="intent" value="quick-login-manager" />
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              🎯 Login as Manager
            </button>
          </Form>

          <Form method="post">
            <input type="hidden" name="intent" value="quick-login-user" />
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
              👤 Login as User
            </button>
          </Form>
        </div>

        {user && (
          <div className="mt-4">
            <Form method="post" className="inline">
              <input type="hidden" name="intent" value="logout" />
              <button className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700">
                🚪 Logout
              </button>
            </Form>
          </div>
        )}
      </div>

      {/* Permission Tests */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
        <h2 className="text-purple-800 font-semibold mb-4">🔐 Permission System Demo</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-medium mb-2">Your Current Permissions:</h3>
            <ul className="text-sm space-y-1">
              <li>Can Manage Users: {permissions.canManageUsers ? "✅ Yes" : "❌ No"}</li>
              <li>Can View Analytics: {permissions.canViewAnalytics ? "✅ Yes" : "❌ No"}</li>
              <li>Is Admin: {permissions.isAdmin ? "✅ Yes" : "❌ No"}</li>
              <li>Is Manager: {permissions.isManager ? "✅ Yes" : "❌ No"}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Test Access Control:</h3>
            <div className="space-y-2">
              <Form method="post" className="inline-block w-full">
                <input type="hidden" name="intent" value="test-require-admin" />
                <button className="w-full bg-purple-600 text-white py-1 px-3 rounded text-sm hover:bg-purple-700">
                  Test: Require Admin Role
                </button>
              </Form>

              <Form method="post" className="inline-block w-full">
                <input type="hidden" name="intent" value="test-require-manage-users" />
                <button className="w-full bg-indigo-600 text-white py-1 px-3 rounded text-sm hover:bg-indigo-700">
                  Test: Require Manage Users
                </button>
              </Form>
            </div>
          </div>
        </div>

        <div className="text-sm text-purple-700">
          <p><strong>Try this:</strong> Login as different roles and test the permission buttons.
            Notice how admin can do everything, manager has some permissions, and user has basic permissions only.</p>
        </div>
      </div>

      {/* Session Debug Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-gray-800 font-semibold mb-4">🔍 Session Debug Info</h2>
        <div className="text-sm font-mono bg-white p-4 rounded border overflow-auto">
          <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          This shows you what the auth system knows about your current session.
        </p>
      </div>

      {/* How It Works */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-yellow-800 font-semibold mb-4">📚 How This Demo Works</h2>
        <div className="text-yellow-700 text-sm space-y-2">
          <p><strong>1. The Loader</strong> calls <code>getCurrentUser(request)</code> to check who's logged in</p>
          <p><strong>2. Permission Checks</strong> use <code>hasPermission()</code> and <code>hasRole()</code> - these don't throw errors</p>
          <p><strong>3. Quick Login</strong> uses <code>quickLogin()</code> to simulate the full login process</p>
          <p><strong>4. Test Buttons</strong> use <code>requireRole()</code> and <code>requirePermission()</code> - these DO throw errors if access denied</p>
          <p><strong>5. Logout</strong> uses <code>logout()</code> to clear the session and redirect</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 text-center">
        <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
