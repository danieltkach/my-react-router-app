import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getCurrentUser } from "~/lib/auth-v2.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // 🎯 Testing: Can we import and call our auth utility?
  const user = await getCurrentUser(request);

  return {
    user,
    timestamp: new Date().toISOString(),
    hasSession: !!user
  };
}

export default function TestAuth() {
  const { user, timestamp, hasSession } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">🧪 Auth System Test</h1>

      {/* Test Results */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Test Results:</h2>

        <div className="space-y-3">
          <div className="flex items-center">
            <span className="font-medium mr-3">✅ Import Working:</span>
            <span className="text-green-600">auth.server.ts imported successfully</span>
          </div>

          <div className="flex items-center">
            <span className="font-medium mr-3">✅ Loader Running:</span>
            <span className="text-green-600">Loaded at {timestamp}</span>
          </div>

          <div className="flex items-center">
            <span className="font-medium mr-3">
              {hasSession ? '✅' : '❌'} Session Status:
            </span>
            <span className={hasSession ? 'text-green-600' : 'text-orange-600'}>
              {hasSession ? 'User found in session' : 'No active session'}
            </span>
          </div>
        </div>
      </div>

      {/* User Data Display */}
      {user ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-green-800 mb-3">Current User:</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Department:</strong> {user.department}</p>
            <p><strong>Permissions:</strong> {user.permissions.join(', ')}</p>
          </div>
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-orange-800 mb-3">No Active Session</h3>
          <p className="text-orange-700 mb-4">To test with a session, manually set a cookie:</p>
          <div className="bg-orange-100 p-3 rounded text-sm font-mono">
            document.cookie = "session=admin; path=/"
          </div>
          <p className="text-orange-600 text-sm mt-2">Then refresh this page.</p>
        </div>
      )}

      {/* Quick Test Actions */}
      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Quick Tests:</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              document.cookie = "session=admin; path=/";
              window.location.reload();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Test Admin Session
          </button>

          <button
            onClick={() => {
              document.cookie = "session=manager; path=/";
              window.location.reload();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test Manager Session
          </button>

          <button
            onClick={() => {
              document.cookie = "session=user; path=/";
              window.location.reload();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Test User Session
          </button>
        </div>

        <button
          onClick={() => {
            document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            window.location.reload();
          }}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Clear Session
        </button>
      </div>
    </div>
  );
}
