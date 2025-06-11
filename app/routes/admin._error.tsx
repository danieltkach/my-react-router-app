import { isRouteErrorResponse, useRouteError, Link } from "react-router";

export default function AdminErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-red-600 text-white p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl font-bold">Admin Panel - Error {error.status}</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">🔒💥</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Admin Access Error
            </h2>
            <p className="text-gray-600 mb-6">
              {error.status === 403
                ? "You don't have permission to access this admin resource."
                : error.status === 404
                  ? "This admin page doesn't exist."
                  : "An error occurred in the admin panel."
              }
            </p>
            <div className="space-x-4">
              <Link
                to="/admin"
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <h1 className="text-xl font-bold text-red-600 mb-4">
          Critical Admin Error
        </h1>
        <p className="text-gray-600 mb-4">
          A critical error occurred in the admin system.
        </p>
        <Link
          to="/"
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          Exit Admin
        </Link>
      </div>
    </div>
  );
}