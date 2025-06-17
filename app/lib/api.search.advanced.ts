import type { LoaderFunctionArgs } from "react-router";
import { searchProducts, getAllProducts } from "~/lib/products.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const category = url.searchParams.get("category") || "";
  const minPrice = Number(url.searchParams.get("minPrice")) || 0;
  const maxPrice = Number(url.searchParams.get("maxPrice")) || Infinity;
  const sortBy = url.searchParams.get("sortBy") || "relevance";
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 12;

  // Start with all products or search results
  let results = query ? searchProducts(query) : getAllProducts();

  // Apply filters
  if (category) {
    results = results.filter(product => product.categorySlug === category);
  }

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
        // Score by relevance (name match > description match)
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

  // Simulate API delay for demo
  await new Promise(resolve => setTimeout(resolve, query ? 300 : 100));

  return Response.json({
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
    },
    timestamp: new Date().toISOString()
  });
}
