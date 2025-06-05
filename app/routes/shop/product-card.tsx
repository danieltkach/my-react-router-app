interface ProductCardProps {
  name: string;
  price: number;
  image: string;
  category: string;
}

export function ProductCard({ name, price, image, category }: ProductCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <img src={image} alt={name} className="w-full h-48 object-cover rounded mb-4" />
      <h3 className="font-semibold mb-2">{name}</h3>
      <p className="text-gray-600 mb-2">{category}</p>
      <p className="text-blue-600 font-bold text-lg">${price}</p>
      <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
        Add to Cart
      </button>
    </div>
  );
}