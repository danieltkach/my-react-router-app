export default function RelatedProducts() {
  const relatedProducts = [
    {
      id: 1,
      name: "Related Product 1",
      price: 199.99,
      image: "https://picsum.photos/200/200?random=5"
    },
    {
      id: 2,
      name: "Related Product 2",
      price: 149.99,
      image: "https://picsum.photos/200/200?random=6"
    },
    {
      id: 3,
      name: "Related Product 3",
      price: 249.99,
      image: "https://picsum.photos/200/200?random=7"
    },
    {
      id: 4,
      name: "Related Product 4",
      price: 179.99,
      image: "https://picsum.photos/200/200?random=8"
    }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Related Products</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedProducts.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <h4 className="font-medium text-sm mb-1">{product.name}</h4>
            <p className="text-blue-600 font-bold">${product.price}</p>
            <button className="w-full mt-2 bg-blue-600 text-white py-1 px-2 rounded text-sm hover:bg-blue-700">
              View Product
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}