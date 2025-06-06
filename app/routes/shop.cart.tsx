export default function ShoppingCart() {
  const cartItems = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 299.99,
      quantity: 1,
      image: "https://picsum.photos/100/100?random=1"
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: 199.99,
      quantity: 2,
      image: "https://picsum.photos/100/100?random=2"
    }
  ];

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Shopping Cart</h1>

      <div className="space-y-4 mb-8">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center bg-white border rounded-lg p-4">
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 object-cover rounded mr-4"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
              <p className="text-gray-600">${item.price}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="bg-gray-200 px-2 py-1 rounded">-</button>
              <span className="px-4">{item.quantity}</span>
              <button className="bg-gray-200 px-2 py-1 rounded">+</button>
            </div>
            <div className="ml-4 font-bold text-blue-600">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-100 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
        </div>
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
