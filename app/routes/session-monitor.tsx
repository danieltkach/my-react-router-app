// app/routes/session-monitor.tsx - Comprehensive V2 Session Monitoring Dashboard
import { useLoaderData, Form, useFetcher, useRevalidator, Link } from "react-router";
import { useState, useEffect } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { 
  getCurrentUser, 
  getSessionInfo, 
  getSecurityHealth,
  logout,
  logoutAllDevices,
  quickLogin,
  refreshCurrentSession
} from "~/lib/auth-v2.server";
import { redirect } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request);
  const sessionInfo = await getSessionInfo(request);
  const securityHealth = await getSecurityHealth();

  return {
    user,
    sessionInfo,
    securityHealth,
    timestamp: new Date().toISOString(),
    url: request.url
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  switch (intent) {
    case "quick-login":
      const userType = formData.get("userType") as "admin" | "manager" | "user";
      if (process.env.NODE_ENV === "development") {
        return await quickLogin(request, userType);
      }
      return { error: "Quick login only available in development" };

    case "logout":
      return await logout(request, "/session-monitor");

    case "logout-all":
      return await logoutAllDevices(request);

    case "refresh-session":
      const session = await refreshCurrentSession(request);
      return { 
        success: session ? "Session refreshed successfully" : "Failed to refresh session",
        session 
      };

    default:
      return { error: "Invalid action" };
  }
}

export default function SessionMonitor() {
  const { user, sessionInfo, securityHealth, timestamp, url } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Auto-refresh every 5 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, revalidator]);

  const isActionPending = fetcher.state === "submitting";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">V2 Session Monitor</h1>
          <p className="text-gray-600 mt-2">
            Production-Ready Authentication & Security Dashboard
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Auto-refresh (5s)</span>
          </label>
          
          <button
            onClick={() => revalidator.revalidate()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            disabled={revalidator.state === "loading"}
          >
            {revalidator.state === "loading" ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">System Status</h2>
            <p className="text-blue-100">Last updated: {new Date(timestamp).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {sessionInfo.isValid ? "🟢 SECURE" : "🔴 INACTIVE"}
            </div>
            <p className="text-blue-100">
              {user ? `${user.name} (${user.role})` : "Not authenticated"}
            </p>
          </div>
        </div>
      </div>

      {/* Action Messages */}
      {fetcher.data?.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-700">✅ {fetcher.data.success}</p>
        </div>
      )}
      
      {fetcher.data?.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">❌ {fetcher.data.error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Current User Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              👤 Current User
              {user && (
                <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.role.toUpperCase()}
                </span>
              )}
            </h2>
            
            {user ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{user.department || "N/A"}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Permissions</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.permissions.map((permission, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {typeof permission === 'number' ? `PERM_${permission}` : permission}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">Account Status</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={user.isActive ? "text-green-600" : "text-red-600"}>
                      {user.isActive ? "✅ Active" : "❌ Inactive"}
                    </span>
                    <span className={user.emailVerified ? "text-green-600" : "text-yellow-600"}>
                      {user.emailVerified ? "✅ Verified" : "⚠️ Unverified"}
                    </span>
                    <span className={user.twoFactorEnabled ? "text-green-600" : "text-gray-500"}>
                      {user.twoFactorEnabled ? "🔐 2FA" : "🔓 No 2FA"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Not authenticated</p>
                
                {/* Quick Login for Development */}
                {process.env.NODE_ENV === "development" && (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-600 mb-3">Quick Login (Development)</p>
                    <div className="flex justify-center space-x-2">
                      {["admin", "manager", "user"].map((userType) => (
                        <fetcher.Form key={userType} method="post" style={{ display: "inline" }}>
                          <input type="hidden" name="intent" value="quick-login" />
                          <input type="hidden" name="userType" value={userType} />
                          <button
                            type="submit"
                            disabled={isActionPending}
                            className={`px-3 py-1 text-xs rounded ${
                              userType === "admin" ? "bg-red-100 text-red-700 hover:bg-red-200" :
                              userType === "manager" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" :
                              "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {userType}
                          </button>
                        </fetcher.Form>
                      ))}
                    </div>
                  </div>
                )}
                
                <Link 
                  to="/auth-v2/login" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-3"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Session Details Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">🔐 Session Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`font-medium ${sessionInfo.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {sessionInfo.isValid ? "✅ Valid" : "❌ Invalid"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reason</p>
                  <p className="font-medium">{sessionInfo.reason || "Session is valid"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Client IP</p>
                  <p className="font-medium font-mono">{sessionInfo.clientIP}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">User Agent</p>
                  <p className="font-medium text-xs truncate" title={sessionInfo.userAgent}>
                    {sessionInfo.userAgent?.slice(0, 30)}...
                  </p>
                </div>
              </div>

              {sessionInfo.session && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">Session Information</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Session ID:</span>
                      <span className="font-mono text-xs">
                        {sessionInfo.session.sessionId.slice(0, 12)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{new Date(sessionInfo.session.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span>{new Date(sessionInfo.session.expiresAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remember Me:</span>
                      <span>{sessionInfo.session.rememberMe ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Session Actions */}
          {user && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">⚡ Session Actions</h2>
              
              <div className="space-y-3">
                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="refresh-session" />
                  <button
                    type="submit"
                    disabled={isActionPending}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    🔄 Refresh Session
                  </button>
                </fetcher.Form>

                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="logout" />
                  <button
                    type="submit"
                    disabled={isActionPending}
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                  >
                    🚪 Logout Current Session
                  </button>
                </fetcher.Form>

                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="logout-all" />
                  <button
                    type="submit"
                    disabled={isActionPending}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    🧹 Logout All Devices
                  </button>
                </fetcher.Form>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Security Health Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">🛡️ Security Health</h2>
            
            <div className="space-y-4">
              {/* Rate Limiting Stats */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Rate Limiting</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">Login Attempts</p>
                    <p className="text-lg font-bold text-blue-600">
                      {securityHealth.rateLimiting.loginAttempts}
                    </p>
                    <p className="text-xs text-gray-500">
                      Limit: {securityHealth.rateLimiting.loginLimitPerMinute}/min
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">General Requests</p>
                    <p className="text-lg font-bold text-green-600">
                      {securityHealth.rateLimiting.generalRequests}
                    </p>
                    <p className="text-xs text-gray-500">
                      Limit: {securityHealth.rateLimiting.generalLimitPerMinute}/min
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Configuration */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Security Configuration</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>CSRF Protection:</span>
                    <span className={securityHealth.security.csrfEnabled ? "text-green-600" : "text-red-600"}>
                      {securityHealth.security.csrfEnabled ? "✅ Enabled" : "❌ Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Production Mode:</span>
                    <span className={securityHealth.security.isProduction ? "text-green-600" : "text-yellow-600"}>
                      {securityHealth.security.isProduction ? "✅ Production" : "⚠️ Development"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Password Min Length:</span>
                    <span className="text-gray-700">
                      {securityHealth.security.passwordMinLength} chars
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bcrypt Rounds:</span>
                    <span className="text-gray-700">
                      {securityHealth.security.bcryptRounds}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Statistics */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">User Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-blue-700 font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {securityHealth.users.totalUsers}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-green-700 font-medium">Active Users</p>
                    <p className="text-2xl font-bold text-green-600">
                      {securityHealth.users.activeUsers}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <p className="text-purple-700 font-medium">Verified Users</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {securityHealth.users.verifiedUsers}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded">
                    <p className="text-orange-700 font-medium">2FA Enabled</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {securityHealth.users.twoFactorUsers}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">💻 System Information</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Current URL:</span>
                <span className="font-mono text-xs">{new URL(url).pathname}</span>
              </div>
              <div className="flex justify-between">
                <span>Server Time:</span>
                <span>{new Date(securityHealth.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Environment:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  process.env.NODE_ENV === "production" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {process.env.NODE_ENV?.toUpperCase() || "UNKNOWN"}
                </span>
              </div>
            </div>
          </div>

          {/* Debug Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">🔍 Debug Information</h2>
            <details className="cursor-pointer">
              <summary className="font-medium text-gray-700 hover:text-gray-900">
                Raw Session Data (Click to expand)
              </summary>
              <pre className="mt-3 text-xs bg-white p-4 rounded border overflow-auto max-h-64">
                {JSON.stringify({ 
                  user, 
                  sessionInfo, 
                  securityHealth, 
                  timestamp 
                }, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>V2 Authentication System - Production Ready Security</p>
        <p>Last refresh: {new Date(timestamp).toLocaleString()}</p>
      </div>
    </div>
  );
}