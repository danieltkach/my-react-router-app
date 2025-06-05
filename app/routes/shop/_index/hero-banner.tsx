export default function HeroBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-8 rounded-lg mb-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Our Shop
        </h1>
        <p className="text-xl mb-8">
          Discover amazing products at unbeatable prices
        </p>
        <div className="space-x-4">
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
            Shop Now
          </button>
          <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}