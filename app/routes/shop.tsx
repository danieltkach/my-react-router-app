import { Link, Outlet, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUser } from "~/lib/auth.server";
import { getUserCart } from "~/lib/cart.server";
import { Form } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { destroySession } from "~/lib/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  if (formData.get("intent") === "logout") {
    const headers = new Headers();
    headers.append("Set-Cookie", destroySession());
    throw redirect("/auth/login", { headers });
  }

  return {};
}

// 🎯 Teaching Point: Shop layout loads cart data for all shop pages
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  let cartItemCount = 0;

  if (user) {
    const cart = await getUserCart(user);
    cartItemCount = cart.itemCount;
  }

  return { user, cartItemCount };
}

export default function ShopLayout() {
  const { user, cartItemCount } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🎯 Teaching Point: Professional shop header with dynamic data */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">🛍️ Our Shop</h1>
          <nav className="flex items-center space-x-6">
            <a href="/shop" className="hover:underline font-medium">
              🏠 Home
            </a>
            <a href="/shop/products" className="hover:underline font-medium">
              📦 Products
            </a>
            <a href="/shop/cart" className="hover:underline font-medium relative">
              🛒 Cart
              {/* 🎯 Dynamic cart count badge */}
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </a>

            {/* 🎯 User-specific navigation - cleaner than "Account" */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/account/profile" className="text-sm hover:text-gray-200 transition-colors">
                  👋 Hi, <strong>{user.name.split(' ')[0]}</strong>
                </Link>
                <Link to="/account/orders" className="hover:underline text-sm">
                  📋 My Orders
                </Link>
                {/* ADD LOGOUT BUTTON */}
                <Form method="post" style={{ display: 'inline' }}>
                  <input type="hidden" name="intent" value="logout" />
                  <button
                    type="submit"
                    className="text-sm text-red-200 hover:text-white transition-colors"
                  >
                    🚪 Logout
                  </button>
                </Form>
              </div>
            ) : (
              <a href="/auth/login" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 font-medium">
                🔐 Login
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* 🎯 Teaching Point: Improved promotional banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-2 text-center font-medium">
        <span className="inline-flex items-center">
          🎉 Free shipping on orders over $50!
          {user && cartItemCount > 0 && (
            <span className="ml-2 bg-white/20 px-2 py-1 rounded text-sm">
              You have {cartItemCount} item{cartItemCount !== 1 ? 's' : ''} in cart
            </span>
          )}
        </span>
      </div>

      {/* 🎯 Teaching Point: This is where child routes render */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* 🎯 Teaching Point: Cleaner footer with shop-specific links */}
      <footer className="bg-gray-800 text-white p-8 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">Shop Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/shop/category/electronics" className="hover:text-gray-300">Electronics</a></li>
              <li><a href="/shop/category/clothing" className="hover:text-gray-300">Clothing</a></li>
              <li><a href="/shop/category/home" className="hover:text-gray-300">Home & Garden</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/contact" className="hover:text-gray-300">Contact Us</a></li>
              <li><a href="/shop/faq" className="hover:text-gray-300">FAQ</a></li>
              <li><a href="/shop/returns" className="hover:text-gray-300">Returns</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">My Account</h3>
            <ul className="space-y-2 text-sm">
              {user ? (
                <>
                  <li><a href="/account/orders" className="hover:text-gray-300">My Orders</a></li>
                  <li><a href="/account/profile" className="hover:text-gray-300">My Profile</a></li>
                  <li><a href="/shop/cart" className="hover:text-gray-300">Shopping Cart</a></li>
                </>
              ) : (
                <>
                  <li><a href="/auth/login" className="hover:text-gray-300">Login</a></li>
                  <li><a href="/auth/register" className="hover:text-gray-300">Create Account</a></li>
                  <li><a href="/account/perks" className="hover:text-gray-300">Member Benefits</a></li>
                </>
              )}
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-gray-300">📘 Facebook</a></li>
              <li><a href="#" className="hover:text-gray-300">🐦 Twitter</a></li>
              <li><a href="#" className="hover:text-gray-300">📷 Instagram</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 Our Shop. Built with React Router 7 - Part 5 Complete! 🚀</p>
        </div>
      </footer>
    </div>
  );
}