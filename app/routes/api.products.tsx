export async function loader() {
  const products = [
    { id: 1, name: "Laptop", price: 999.99, category: "electronics" },
    { id: 2, name: "Headphones", price: 199.99, category: "electronics" },
    { id: 3, name: "Coffee Mug", price: 12.99, category: "home" }
  ];

  return Response.json({
    products,
    total: products.length,
    categories: ["electronics", "home", "clothing"]
  });
}
