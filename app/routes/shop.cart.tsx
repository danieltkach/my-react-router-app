export default function ShoppingCart() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Shopping Cart</h1>
      <div className="bg-gray-100 p-8 rounded-lg text-center">
        <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
        <a
          href="/shop"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </a>
      </div>
    </div>
  );
}