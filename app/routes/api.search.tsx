import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const category = url.searchParams.get("category") || "";

  // Mock search results
  const allResults = [
    { id: 1, title: "React Router Guide", type: "blog", category: "tutorial" },
    { id: 2, title: "Wireless Headphones", type: "product", category: "electronics" },
    { id: 3, title: "Coffee Maker", type: "product", category: "home" },
    { id: 4, title: "CSS Tips", type: "blog", category: "tutorial" }
  ];

  let results = allResults;

  if (query) {
    results = results.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  if (category) {
    results = results.filter(item => item.category === category);
  }

  return Response.json({
    query,
    category,
    results,
    total: results.length,
    timestamp: new Date().toISOString()
  });
}
