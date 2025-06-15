import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUser } from "~/lib/auth.server";
import { getUserCart } from "~/lib/cart.server";
import FeaturedProducts from "~/components/shop/featured-products";

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
      {/* Hero Section with Cart Info */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-8 rounded-lg mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Welcome to Our Shop
          </h2>
          <p className="text-xl mb-8">
            Discover amazing products with working Add to Cart functionality!
          </p>

          {/* Cart Status */}
          {user && (
            <div className="bg-white/20 rounded-lg p-4 mb-6 inline-block">
              <p className="text-lg">
                👋 Welcome back, <strong>{user.name}</strong>!
              </p>
              <p className="text-sm">
                🛒 Cart: <strong>{cartItemCount} items</strong>
                {cartItemCount > 0 && (
                  <a href="/shop/cart" className="ml-2 underline hover:no-underline">
                    View Cart →
                  </a>
                )}
              </p>
            </div>
          )}

          {!user && (
            <div className="bg-yellow-500/80 rounded-lg p-4 mb-6 inline-block">
              <p className="text-sm">
                🔒 <a href="/auth/login" className="underline hover:no-underline">Login</a> to save items to your cart!
              </p>
            </div>
          )}

          <div className="space-x-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Shop Now
            </button>
            {user && cartItemCount > 0 && (
              <a
                href="/shop/cart"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-block"
              >
                View Cart ({cartItemCount})
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Layout Demonstration Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h3 className="text-green-800 font-semibold mb-2">
          ✅ Add to Cart Demo Working!
        </h3>
        <p className="text-green-700">
          The products below now have REAL Add to Cart functionality:
        </p>
        <ul className="text-green-700 mt-2 ml-4 list-disc text-sm">
          <li>✅ Optimistic UI with loading states</li>
          <li>✅ Stock validation and error handling</li>
          <li>✅ User authentication integration</li>
          <li>✅ Professional feedback messages</li>
        </ul>
        <p className="text-green-700 mt-2">
          Try adding items and then check your <a href="/shop/cart" className="underline font-medium">cart</a>!
        </p>
      </div>

      <FeaturedProducts />
    </div>
  );
}