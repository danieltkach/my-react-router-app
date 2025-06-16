/*
  In a typical Vite app, the index.html file is the entry point for bundling.
  The React Router Vite plugin moves the entry point to a root.tsx file so you 
  can use React to render the shell of your app instead of static HTML, 
  and eventually upgrade to Server Rendering if you want.
*/

// app/root.tsx - CLEANED UP VERSION
import { Outlet, Scripts, Meta, Links, Link, useRouteError, isRouteErrorResponse } from "react-router";
import "./app.css";

export default function Root() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {/* 🎯 No more AuthProvider - using server-side auth now! */}
        <nav className="bg-blue-600 text-white p-4">
          <div className="flex space-x-4">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/about" className="hover:underline">About</Link>
            <Link to="/blog" className="hover:underline">Blog</Link>
            <Link to="/shop" className="hover:underline">Shop</Link>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/auth/login" className="hover:underline">Login</Link>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          <Outlet />
        </main>
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  console.log("🚨 ROOT ERROR BOUNDARY TRIGGERED!", error);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <title>Oops! Something went wrong</title>
      </head>
      <body>
        <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">💥</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Oops! Something went wrong
            </h1>

            {isRouteErrorResponse(error) ? (
              <>
                <p className="text-gray-600 mb-4">
                  {error.status} - {error.statusText}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  {error.data}
                </p>
              </>
            ) : (
              <p className="text-gray-600 mb-6">
                An unexpected error occurred. Please try again.
              </p>
            )}

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

            {/* Show error details in development */}
            {import.meta.env.DEV && (
              <details className="mt-6 text-left bg-gray-100 p-4 rounded">
                <summary className="cursor-pointer font-medium">Error Details</summary>
                <pre className="mt-2 text-xs overflow-auto text-red-600">
                  {error instanceof Error ? error.stack : String(error)}
                </pre>
              </details>
            )}
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}