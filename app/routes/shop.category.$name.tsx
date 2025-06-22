import { Link } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getProductsByCategory } from "~/lib/products.server";
import { ProductCard } from "~/components/shop/product-card";
import type { Route } from "./+types/shop.category.$name";

export async function loader({ params }: LoaderFunctionArgs) {
  const categoryName = params.name; // Changed from params.category

  console.log('Category Loader (new route):', { categoryName });

  if (!categoryName) {
    throw new Response("Category not found", { status: 404 });
  }

  // Define valid categories
  const validCategories = ['electronics', 'clothing', 'home'];

  if (!validCategories.includes(categoryName)) {
    throw new Response("Category not found", { status: 404 });
  }

  // Get products using centralized data
  const products = getProductsByCategory(categoryName);

  // Category display names
  const categoryNames: Record<string, string> = {
    electronics: "Electronics",
    clothing: "Clothing",
    home: "Home & Garden"
  };

  const categoryTitle = categoryNames[categoryName];

  return {
    categorySlug: categoryName,
    categoryTitle,
    products
  };
}

export default function ShopCategory({ loaderData }: Route.ComponentProps) {
  const { categorySlug, categoryTitle, products } = loaderData;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Success: New route structure */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h3 className="text-green-800 font-semibold mb-2">✅ New Route Structure Working!</h3>
        <p className="text-green-700 text-sm">
          <strong>URL:</strong> /shop/category/{categorySlug}<br />
          <strong>File:</strong> shop.category.$name.tsx<br />
          <strong>Products:</strong> {products.length}
        </p>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span className="text-gray-400">/</span>
        <Link to="/shop" className="hover:text-blue-600">Shop</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{categoryTitle}</span>
      </nav>

      {/* Category Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {categoryTitle} Collection
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover our curated selection of {categoryTitle.toLowerCase()} products
        </p>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              image={product.image}
              category={product.categorySlug}
              slug={product.slug}
              rating={product.rating}
              reviews={product.reviews}
              stock={product.stock}
              badge={product.badge}
              showAddToCart={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            No products found in {categoryTitle}
          </h2>
          <p className="text-gray-500 mb-6">
            This category is coming soon! Check back later.
          </p>
          <Link
            to="/shop"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
          >
            Browse All Products
          </Link>
        </div>
      )}

      {/* Category Links */}
      <div className="mt-12 text-center">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse Other Categories</h3>
          <div className="flex justify-center space-x-4">
            <Link
              to="/shop/category/electronics"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${categorySlug === 'electronics'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Electronics
            </Link>
            <Link
              to="/shop/category/clothing"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${categorySlug === 'clothing'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Clothing
            </Link>
            <Link
              to="/shop/category/home"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${categorySlug === 'home'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Home & Garden
            </Link>
          </div>
        </div>

        <Link
          to="/shop"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Shop Home
        </Link>
      </div>
    </div>
  );
}