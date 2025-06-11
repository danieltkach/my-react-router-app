import { Link } from "react-router";

export default function FeaturedProducts() {
  const featuredProducts = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 299.99,
      originalPrice: 399.99,
      image: "https://picsum.photos/300/300?random=1",
      category: "Electronics",
      rating: 4.8,
      reviews: 124,
      badge: "Best Seller"
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: 199.99,
      originalPrice: 249.99,
      image: "https://picsum.photos/300/300?random=2",
      category: "Wearables",
      rating: 4.6,
      reviews: 89,
      badge: "New Arrival"
    },
    {
      id: 3,
      name: "Professional Camera Lens",
      price: 899.99,
      originalPrice: null,
      image: "https://picsum.photos/300/300?random=3",
      category: "Photography",
      rating: 4.9,
      reviews: 67,
      badge: "Pro Choice"
    },
    {
      id: 4,
      name: "Ergonomic Office Chair",
      price: 449.99,
      originalPrice: 599.99,
      image: "https://picsum.photos/300/300?random=4",
      category: "Furniture",
      rating: 4.7,
      reviews: 156,
      badge: "Sale"
    }
  ];

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
      case "Best Seller":
        return "bg-green-500";
      case "New Arrival":
        return "bg-blue-500";
      case "Pro Choice":
        return "bg-purple-500";
      case "Sale":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Products</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Check out our handpicked selection of the most popular and highly-rated products
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white border rounded-lg overflow-hidden hover:shadow-lg relative"
          >
            {/* Badge */}
            <div className={`absolute top-2 left-2 ${getBadgeColor(product.badge)} text-white text-xs px-2 py-1 rounded-full z-10`}>
              {product.badge}
            </div>

            {/* Product Image */}
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="text-sm text-gray-500 mb-1">{product.category}</div>
              <h3 className="font-semibold text-gray-800 mb-2">
                {product.name}
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

              {/* Add to Cart Button */}
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View All Products Link */}
      <div className="text-center mt-8">
        <Link
          to="/shop/all"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          View All Products
          <span className="ml-2">&gt;</span>
        </Link>
      </div>
    </div>
  );
}