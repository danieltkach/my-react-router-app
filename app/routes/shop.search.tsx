// app/routes/shop.search.tsx - FIXED SEARCH PAGE
import { useState, useEffect } from "react";
import { useLoaderData, useSearchParams, useFetcher, Link } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getAllProducts } from "~/lib/products.server";
import { ProductCard } from "~/components/shop/product-card";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // Instead of fetching from API, call the search logic directly
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const minPrice = Number(searchParams.get("minPrice")) || 0;
  const maxPrice = Number(searchParams.get("maxPrice")) || 1000;
  const sortBy = searchParams.get("sortBy") || "relevance";
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 12;

  // Get all products and filter them
  let results = getAllProducts();

  // Apply search filter
  if (query) {
    const searchTerm = query.toLowerCase();
    results = results.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }

  // Apply category filter
  if (category) {
    results = results.filter(product => product.categorySlug === category);
  }

  // Apply price filter
  results = results.filter(product =>
    product.price >= minPrice && product.price <= maxPrice
  );

  // Apply sorting
  switch (sortBy) {
    case "price-low":
      results.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      results.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      results.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      results.sort((a, b) => b.id.localeCompare(a.id));
      break;
    default: // relevance
      if (query) {
        results.sort((a, b) => {
          const aNameMatch = a.name.toLowerCase().includes(query.toLowerCase()) ? 2 : 0;
          const aDescMatch = a.description.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
          const bNameMatch = b.name.toLowerCase().includes(query.toLowerCase()) ? 2 : 0;
          const bDescMatch = b.description.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
          return (bNameMatch + bDescMatch) - (aNameMatch + aDescMatch);
        });
      }
  }

  // Pagination
  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedResults = results.slice(offset, offset + limit);

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, query ? 300 : 100));

  return {
    results: paginatedResults,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    filters: {
      query,
      category,
      minPrice,
      maxPrice,
      sortBy
    },
    facets: {
      categories: [...new Set(getAllProducts().map(p => p.categorySlug))],
      priceRanges: [
        { label: "Under $50", min: 0, max: 50 },
        { label: "$50 - $100", min: 50, max: 100 },
        { label: "$100 - $200", min: 100, max: 200 },
        { label: "$200+", min: 200, max: Infinity }
      ]
    }
  };
}

export default function SearchPage() {
  const initialData = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFetcher = useFetcher<typeof loader>();

  // Search state
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "relevance");
  const [priceRange, setPriceRange] = useState({
    min: Number(searchParams.get("minPrice")) || 0,
    max: Number(searchParams.get("maxPrice")) || 1000
  });

  // Use fetcher data if available, otherwise initial data
  const data = searchFetcher.data || initialData;
  const isSearching = searchFetcher.state === "loading";

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newParams = new URLSearchParams();
      if (query) newParams.set("q", query);
      if (category) newParams.set("category", category);
      if (sortBy !== "relevance") newParams.set("sortBy", sortBy);
      if (priceRange.min > 0) newParams.set("minPrice", priceRange.min.toString());
      if (priceRange.max < 1000) newParams.set("maxPrice", priceRange.max.toString());

      // Update URL without navigation
      setSearchParams(newParams, { replace: true });

      // Fetch new results by reloading this route with new params
      searchFetcher.load(`/shop/search?${newParams.toString()}`);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, category, sortBy, priceRange, searchFetcher, setSearchParams]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* RR7 Feature Demo */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
        <h2 className="text-purple-800 font-semibold mb-2">🚀 React Router 7 Features Demo</h2>
        <div className="text-purple-700 text-sm space-y-1">
          <p><strong>✅ Resource Routes:</strong> API endpoint at /api/search/advanced</p>
          <p><strong>✅ Real-time Search:</strong> Debounced queries with useFetcher</p>
          <p><strong>✅ URL State Management:</strong> Search params sync with URL</p>
          <p><strong>✅ Progressive Enhancement:</strong> Works without JavaScript</p>
          <p><strong>✅ Optimistic UI:</strong> Instant feedback while searching</p>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Product Search
        {data.filters.query && (
          <span className="text-lg text-gray-600 ml-4">
            Results for "{data.filters.query}"
          </span>
        )}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

            {/* Search Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {data.facets.categories.map((cat: string) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${priceRange.min}</span>
                  <span>${priceRange.max}</span>
                </div>
              </div>
            </div>

            {/* Quick Price Filters */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Filters</p>
              <div className="space-y-1">
                {data.facets.priceRanges.map((range: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setPriceRange({ min: range.min, max: range.max })}
                    className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {/* Sort and Results Count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              {isSearching ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                `${data.pagination.total} products found`
              )}
            </p>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* Results Grid */}
          <div className={`transition-opacity duration-200 ${isSearching ? 'opacity-50' : 'opacity-100'}`}>
            {data.results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.results.map((product: any) => (
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
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or browse our categories
                </p>
                <Link
                  to="/shop"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
                >
                  Browse All Products
                </Link>
              </div>
            )}
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {data.pagination.hasPrev && (
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set("page", (data.pagination.page - 1).toString());
                      setSearchParams(newParams);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                )}

                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  {data.pagination.page} of {data.pagination.totalPages}
                </span>

                {data.pagination.hasNext && (
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set("page", (data.pagination.page + 1).toString());
                      setSearchParams(newParams);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}