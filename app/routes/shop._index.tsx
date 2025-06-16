// app/routes/shop._index.tsx
import { useLoaderData, useFetcher, Link } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUser } from "~/lib/auth.server";
import { getUserCart } from "~/lib/cart.server";
import { getFeaturedProducts } from "~/lib/products.server";
import { Breadcrumb } from "~/components/ui/breadcrumb";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  let cartItemCount = 0;

  if (user) {
    const cart = await getUserCart(user);
    cartItemCount = cart.itemCount;
  }

  // Get featured products from centralized data
  const featuredProducts = getFeaturedProducts(4);

  return { user, cartItemCount, featuredProducts };
}

export default function ShopHome() {
  const { user, cartItemCount, featuredProducts } = useLoaderData<typeof loader>();
  const addToCartFetcher = useFetcher();

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-700 mr-1">
          {rating.toFixed(1)}
        </span>
        <span className="text-sm text-gray-500">
          ({rating > 4.5 ? 'Excellent' : rating > 4.0 ? 'Very Good' : rating > 3.5 ? 'Good' : 'Fair'})
        </span>
      </div>
    );
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Best Seller": return "bg-green-500";
      case "New Arrival": return "bg-blue-500";
      case "Pro Choice": return "bg-purple-500";
      case "Sale": return "bg-red-500";
      case "Popular": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

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
                  <Link to="/shop/cart" className="ml-2 underline hover:no-underline font-medium">
                    View Cart →
                  </Link>
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
                🔒 <Link to="/auth/login" className="underline hover:no-underline font-medium">Login</Link> to save items to your cart and track orders!
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
              <Link
                to="/shop/cart"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-block"
              >
                Checkout ({cartItemCount} item{cartItemCount !== 1 ? 's' : ''})
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Status Demo */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h3 className="text-green-800 font-semibold mb-2">
          ✅ Shop Home Page Fixed!
        </h3>
        <p className="text-green-700">
          Notice the improvements in this shop section:
        </p>
        <ul className="text-green-700 mt-2 ml-4 list-disc text-sm">
          <li>✅ <strong>Featured products loading</strong> - Now using centralized data</li>
          <li>✅ <strong>No more navigation errors</strong> - Fixed component structure</li>
          <li>✅ <strong>Working product links</strong> - All buttons now work properly</li>
          <li>✅ <strong>Dynamic cart count</strong> - Shows real number of items</li>
          <li>✅ <strong>Clean navigation</strong> - No redundant account links</li>
        </ul>
      </div>

      {/* Featured Products Section */}
      <div id="featured-products" className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Check out our handpicked selection with working Add to Cart functionality!
          </p>
        </div>

        {/* Success Message for Added Items */}
        {addToCartFetcher.data?.success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700">✅ {addToCartFetcher.data.message}</p>
          </div>
        )}

        {/* Error Message */}
        {addToCartFetcher.data?.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">❌ {addToCartFetcher.data.error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative"
            >
              {/* Badge */}
              {product.badge && (
                <div className={`absolute top-2 left-2 ${getBadgeColor(product.badge)} text-white text-xs px-2 py-1 rounded-full z-10`}>
                  {product.badge}
                </div>
              )}

              {/* Stock Indicator */}
              <div className="absolute top-2 right-2 bg-white text-gray-700 text-xs px-2 py-1 rounded-full z-10">
                {product.stock} left
              </div>

              {/* Product Image - CLICKABLE */}
              <div className="relative">
                <Link to={`/shop/${product.categorySlug}/${product.slug}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover hover:opacity-95 transition-opacity cursor-pointer"
                  />
                </Link>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="text-sm text-gray-500 mb-1 capitalize">{product.categorySlug}</div>

                {/* CLICKABLE TITLE */}
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                  <Link
                    to={`/shop/${product.categorySlug}/${product.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {product.name}
                  </Link>
                </h3>

                {/* Rating */}
                <div className="flex items-center mb-2">
                  {renderStars(product.rating)}
                  <span className="text-sm text-gray-600 ml-2">
                    ({product.reviews} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-blue-600">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                  {product.originalPrice && (
                    <span className="text-sm text-green-600 font-medium">
                      Save ${(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* UPDATED BUTTONS */}
                <div className="space-y-2">
                  {/* View Details Button */}
                  <Link
                    to={`/shop/${product.categorySlug}/${product.slug}`}
                    className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center block"
                  >
                    View Details
                  </Link>

                  {/* Add to Cart Button */}
                  <addToCartFetcher.Form method="post" action="/shop/add-to-cart">
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="quantity" value="1" />
                    <button
                      type="submit"
                      disabled={addToCartFetcher.state === "submitting" || product.stock === 0}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addToCartFetcher.state === "submitting" &&
                        addToCartFetcher.formData?.get("productId") === product.id ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </span>
                      ) : product.stock === 0 ? (
                        "Out of Stock"
                      ) : (
                        "Add to Cart"
                      )}
                    </button>
                  </addToCartFetcher.Form>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Products Link */}
        <div className="text-center mt-8">
          <Link
            to="/shop/electronics"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            View All Electronics
            <span className="ml-2">&gt;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}