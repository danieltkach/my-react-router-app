import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUser } from "~/lib/auth.server";
import { getUserCart } from "~/lib/cart.server";
import FeaturedProducts from "~/components/shop/featured-products";
import { Breadcrumb } from "~/components/ui/breadcrumb";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  let cartItemCount = 0;

  if (user) {
    const cart = await getUserCart(user);
    cartItemCount = cart.itemCount;
  }

  return { user, cartItemCount };
}

export default function ShopHome() {
  const { user, cartItemCount } = useLoaderData<typeof loader>();

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={[
        { label: "Shop", href: "/shop" },
        { label: "Featured Products" }
      ]} />

      {/* Hero Section with Better User Context */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-8 rounded-lg mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Welcome to Our Shop
          </h2>
          <p className="text-xl mb-8">
            Discover amazing products with professional cart functionality!
          </p>

          {/* Cleaner User Status */}
          {user ? (
            <div className="bg-white/20 rounded-lg p-4 mb-6 inline-block">
              <p className="text-lg mb-2">
                👋 Welcome back, <strong>{user.name}</strong>!
              </p>
              {cartItemCount > 0 ? (
                <p className="text-sm">
                  🛒 You have <strong>{cartItemCount} item{cartItemCount !== 1 ? 's' : ''}</strong> in your cart
                  <a href="/shop/cart" className="ml-2 underline hover:no-underline font-medium">
                    View Cart →
                  </a>
                </p>
              ) : (
                <p className="text-sm">
                  🛒 Your cart is empty - start shopping below!
                </p>
              )}
            </div>
          ) : (
            <div className="bg-yellow-500/90 rounded-lg p-4 mb-6 inline-block">
              <p className="text-sm">
                🔒 <a href="/auth/login" className="underline hover:no-underline font-medium">Login</a> to save items to your cart and track orders!
              </p>
            </div>
          )}

          <div className="space-x-4">
            <button
              onClick={() => document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Featured Products
            </button>
            {user && cartItemCount > 0 && (
              <a
                href="/shop/cart"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-block"
              >
                Checkout ({cartItemCount} item{cartItemCount !== 1 ? 's' : ''})
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Status Demo */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h3 className="text-green-800 font-semibold mb-2">
          ✅ Navigation Improvements Complete!
        </h3>
        <p className="text-green-700">
          Notice the improvements in this shop section:
        </p>
        <ul className="text-green-700 mt-2 ml-4 list-disc text-sm">
          <li>✅ <strong>Dynamic cart count</strong> - Shows real number of items</li>
          <li>✅ <strong>Clean navigation</strong> - No redundant account links</li>
          <li>✅ <strong>User context</strong> - Personalized greetings and status</li>
          <li>✅ <strong>Professional hierarchy</strong> - Shop nav vs global nav</li>
          <li>✅ <strong>Smart CTAs</strong> - Different buttons based on cart state</li>
        </ul>
      </div>

      <div id="featured-products">
        <FeaturedProducts />
      </div>
    </div>
  );
}