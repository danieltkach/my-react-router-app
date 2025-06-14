import { Link } from "react-router";

export default function Checkout() {
  return (
    <div className="min-h-screen bg-white">
      {/* 🎯 Teaching Point: Custom minimal header - no navigation distractions */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/shop" className="text-blue-600 hover:text-blue-800 text-sm">
              ← Back to Shop
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Secure Checkout</h1>
          </div>
          <div className="text-sm text-gray-500">
            🔒 SSL Secured
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 🎯 Teaching Point: Educational banner explaining the layout opt-out */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
          <h2 className="text-purple-800 font-semibold mb-2">
            🎯 Layout Opt-out Demonstration
          </h2>
          <p className="text-purple-700 mb-3">
            This checkout page is at <code className="bg-purple-100 px-2 py-1 rounded">/shop/checkout</code>
            but notice what's missing:
          </p>
          <ul className="text-purple-700 ml-4 list-disc">
            <li>❌ No blue shop header with navigation</li>
            <li>❌ No yellow promotional banner</li>
            <li>❌ No footer with company links</li>
            <li>✅ Clean, focused checkout experience</li>
          </ul>
          <p className="text-purple-700 mt-3">
            <strong>Why?</strong> The file is named <code className="bg-purple-100 px-2 py-1 rounded">shop_.checkout.tsx</code>
            (note the trailing underscore), which tells React Router to skip the <code>shop.tsx</code> layout.
          </p>
        </div>

        {/* 🎯 Teaching Point: Clean checkout form without distractions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h2>

            <form className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="ZIP code"
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 font-medium text-lg"
              >
                Complete Order
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Wireless Headphones</span>
                  <span>$299.99</span>
                </div>
                <div className="flex justify-between">
                  <span>Smart Watch</span>
                  <span>$199.99</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>$499.98</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}