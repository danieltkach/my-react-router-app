import { Link, useFetcher } from "react-router";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  slug: string; // Add slug for consistent routing
  rating?: number;
  reviews?: number;
  stock?: number;
  badge?: string;
  showAddToCart?: boolean; // Optional - some contexts might not want cart functionality
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  category,
  slug,
  rating,
  reviews,
  stock = 10,
  badge,
  showAddToCart = true
}: ProductCardProps) {
  const addToCartFetcher = useFetcher();

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Best Seller": return "bg-green-500";
      case "New Arrival": return "bg-blue-500";
      case "Pro Choice": return "bg-purple-500";
      case "Sale": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative">
      {/* Badge */}
      {badge && (
        <div className={`absolute top-2 left-2 ${getBadgeColor(badge)} text-white text-xs px-2 py-1 rounded-full z-10`}>
          {badge}
        </div>
      )}

      {/* Stock Indicator */}
      {stock < 20 && (
        <div className="absolute top-2 right-2 bg-white text-gray-700 text-xs px-2 py-1 rounded-full z-10">
          {stock} left
        </div>
      )}

      {/* Product Image - Clickable */}
      <div className="relative">
        <Link to={`/shop/${category}/${slug}`}>
          <img
            src={image}
            alt={name}
            className="w-full h-48 object-cover hover:opacity-95 transition-opacity cursor-pointer"
          />
        </Link>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="text-sm text-gray-500 mb-1 capitalize">{category}</div>

        {/* Clickable Title */}
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
          <Link
            to={`/shop/${category}/${slug}`}
            className="hover:text-blue-600 transition-colors"
          >
            {name}
          </Link>
        </h3>

        {/* Rating (if provided) */}
        {rating && reviews && (
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-gray-700 mr-1">
              {rating.toFixed(1)} ⭐
            </span>
            <span className="text-sm text-gray-500">
              ({reviews} reviews)
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-blue-600">
              ${price.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {originalPrice && (
            <span className="text-sm text-green-600 font-medium">
              Save ${(originalPrice - price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/*                   👁️ View Details Button */}
          <Link
            to={`/shop/${category}/${slug}`}
            className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center block"
          >
            👁️ View Details
          </Link>

          {/* Add to Cart Button (optional) */}
          {showAddToCart && (
            <addToCartFetcher.Form method="post" action="/shop/add-to-cart">
              <input type="hidden" name="productId" value={id} />
              <input type="hidden" name="quantity" value="1" />
              <button
                type="submit"
                disabled={addToCartFetcher.state === "submitting" || stock === 0}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addToCartFetcher.state === "submitting" &&
                  addToCartFetcher.formData?.get("productId") === id ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : stock === 0 ? (
                  "Out of Stock"
                ) : (
                  "Add to Cart"
                )}
              </button>
            </addToCartFetcher.Form>
          )}
        </div>
      </div>

      {/* Remove the green flash overlay - feedback is handled by the parent component */}
    </div>
  );
}