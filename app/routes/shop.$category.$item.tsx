import { useParams } from "react-router";

export async function serverLoader({ params }: { params: { category: string; item: string; }; }) {
  return {
    product: {
      name: `${params.item} in ${params.category}`,
      price: 299.99,
      description: "Amazing product description",
      category: params.category,
      item: params.item
    }
  };
}

export default function ProductPage() {
  const params = useParams();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        {params.item}
      </h1>
      <p className="text-gray-600 mb-6">
        Category: {params.category}
      </p>

      {/* Product Image */}
      <div className="mb-8">
        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500 text-lg">Product Image</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Product Details</h2>
          <p className="text-gray-700 mb-4">
            This is a detailed description of the {params.item} in the {params.category} category.
          </p>
          <div className="text-2xl font-bold text-blue-600 mb-4">
            $299.99
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Add to Cart
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Specifications</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• High quality materials</li>
            <li>• Modern design</li>
            <li>• 2 year warranty</li>
            <li>• Free shipping</li>
          </ul>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
        <div className="bg-gray-100 p-6 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="font-medium">Sarah M.</span>
            <span className="ml-2 text-sm text-gray-600">4.8 (Excellent)</span>
          </div>
          <p className="text-gray-700">
            Great product! Really happy with this purchase.
          </p>
        </div>
      </div>

      {/* Back to Shop */}
      <div className="mt-8">
        <a
          href="/shop"
          className="text-blue-600 hover:underline"
        >
          ← Back to Shop
        </a>
      </div>
    </div>
  );
}