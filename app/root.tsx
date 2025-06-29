// root.tsx - MIGRATED TO V2 AUTH SYSTEM
import {
  Outlet, Scripts, Meta, Links, Link, useRouteError,
  isRouteErrorResponse, useLoaderData, Form, useLocation
} from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useEffect } from "react";

// 🔄 MIGRATED: V1 → V2 imports
import { getCurrentUser } from "~/lib/auth-v2.server";
import { logout } from "~/lib/auth-v2.server";

import "./app.css";

// 🔄 MIGRATED: Enhanced loader with V2 auth + cart
export async function loader({ request }: LoaderFunctionArgs) {
  // V2 returns null if not authenticated (safe)
  const user = await getCurrentUser(request);

  // 🛒 V2 FEATURE: Get secure cart for navbar
  let cartItemCount = 0;
  if (user) {
    try {
      const { getSecureCart } = await import("~/lib/cart-v2.server");
      const cart = await getSecureCart(request);
      cartItemCount = cart.itemCount;
    } catch (error) {
      console.warn("Could not load cart for navbar:", error);
    }
  }

  return {
    user,
    cartItemCount,
    timestamp: new Date().toISOString()
  };
}

// 🔄 MIGRATED: Enhanced action with V2 logout
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  if (formData.get("intent") === "logout") {
    // V2 logout includes security cleanup and proper redirects
    return logout(request, "/auth/login"); // 👈 Clean route
  }

  return {};
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

export default function Root() {
  const { user, cartItemCount } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <ScrollToTop />

        {/* 🔄 MIGRATED: Enhanced navbar with V2 features */}
        <nav className="bg-blue-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <Link to="/" className="hover:underline">Home</Link>
              <Link to="/about" className="hover:underline">About</Link>
              <Link to="/blog" className="hover:underline">Blog</Link>
              <Link to="/shop" className="hover:underline">Shop</Link>

              {/* 🎯 V2 FEATURE: Role-based navigation */}
              {user && (
                <>
                  <Link to="/dashboard" className="hover:underline">Dashboard</Link>

                  {/* Admin/Manager only links */}
                  {(user.role === "admin" || user.role === "manager") && (
                    <>
                      <Link to="/admin" className="hover:underline">Admin</Link>
                      <Link to="/analytics" className="hover:underline">Analytics</Link>
                    </>
                  )}

                  {/* Admin only links */}
                  {user.role === "admin" && (
                    <Link to="/system" className="hover:underline">System</Link>
                  )}
                </>
              )}
            </div>

            {/* 🔄 MIGRATED: Enhanced user section with V2 data */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* 🛒 V2 FEATURE: Secure cart link */}
                  <Link
                    to="/shop/cart"
                    className="flex items-center space-x-1 hover:underline"
                  >
                    <span>🛒</span>
                    <span>Cart ({cartItemCount})</span>
                  </Link>

                  {/* Enhanced user info with role badge */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      Welcome, <strong>{user.name.split(' ')[0]}</strong>
                    </span>
                    {/* 🎯 V2 FEATURE: Role badge */}
                    <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-red-500' :
                      user.role === 'manager' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}>
                      {user.role}
                    </span>
                  </div>

                  <Link to="/account/profile" className="hover:underline text-sm">
                    Account
                  </Link>

                  {/* 🔄 MIGRATED: V2 logout form */}
                  <Form method="post" style={{ display: 'inline' }}>
                    <input type="hidden" name="intent" value="logout" />
                    <button
                      type="submit"
                      className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm transition-colors"
                    >
                      Logout
                    </button>
                  </Form>
                </>
              ) : (
                <>
                  {/* Guest cart link */}
                  <Link
                    to="/shop/cart"
                    className="flex items-center space-x-1 hover:underline text-sm"
                  >
                    <span>🛒</span>
                    <span>Cart</span>
                  </Link>

                  <Link
                    to="/auth/login"
                    className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
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

// Error boundary remains the same
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
