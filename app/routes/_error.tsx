import { isRouteErrorResponse, useRouteError, Link } from "react-router";

export default function GlobalErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error.status} {error.statusText}
          </h1>
          <p className="text-gray-600 mb-6">
            {error.status === 404
              ? "The page you're looking for doesn't exist."
              : "Something went wrong. Please try again."
            }
          </p>
          <div className="space-y-3">
            <Link
              to="/"
              className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Go Home
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">💥</div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Unexpected Error
        </h1>
        <p className="text-gray-600 mb-6">
          An unexpected error occurred. Our team has been notified.
        </p>
        <details className="text-left mb-6 bg-gray-100 p-4 rounded text-sm">
          <summary className="cursor-pointer font-medium">Error Details</summary>
          <pre className="mt-2 text-xs overflow-auto">
            {error instanceof Error ? error.stack : String(error)}
          </pre>
        </details>
        <Link
          to="/"
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
