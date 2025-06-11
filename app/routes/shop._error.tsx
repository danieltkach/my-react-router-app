import { isRouteErrorResponse, useRouteError, Link } from "react-router";

export default function ShopErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-4xl mb-4">🛍️💔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Shop Error ({error.status})
          </h1>
          <p className="text-gray-600 mb-6">
            {error.status === 404
              ? "This product or page doesn't exist in our shop."
              : "There was a problem with the shop. Please try again."
            }
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/shop"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Browse Shop
            </Link>
            <Link
              to="/shop/cart"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-red-800 mb-2">
          Shop System Error
        </h1>
        <p className="text-red-700 mb-4">
          Our shopping system encountered an unexpected error.
        </p>
        <Link
          to="/shop"
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          Return to Shop
        </Link>
      </div>
    </div>
  );
}
