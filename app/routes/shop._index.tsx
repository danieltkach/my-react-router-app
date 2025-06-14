import FeaturedProducts from "~/components/shop/featured-products";

export default function ShopHome() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-8 rounded-lg mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Welcome to Our Shop
          </h2>
          <p className="text-xl mb-8">
            Discover amazing products at unbeatable prices
          </p>
          <div className="space-x-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Shop Now
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Layout Demonstration Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h3 className="text-green-800 font-semibold mb-2">
          ✅ Layout Demonstration
        </h3>
        <p className="text-green-700">
          This page (<code>/shop</code>) uses the shop layout. Notice the:
        </p>
        <ul className="text-green-700 mt-2 ml-4 list-disc">
          <li>Blue header with navigation</li>
          <li>Yellow promotional banner</li>
          <li>Footer with company links</li>
        </ul>
        <p className="text-green-700 mt-2">
          Compare this to <a href="/shop/checkout" className="underline font-medium">/shop/checkout</a> which skips the layout!
        </p>
      </div>

      <FeaturedProducts />
    </div>
  );
}