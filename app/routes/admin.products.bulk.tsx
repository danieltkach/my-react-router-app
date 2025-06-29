// app/routes/admin.products.bulk.tsx - BULK OPERATIONS DEMO
import { useState } from "react";
import { useLoaderData, useFetcher, Form } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { requireRole } from "~/lib/auth-v2.server";
import { UserRole } from "~/types/auth-v2";
import { getAllProducts } from "~/lib/products.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireRole(request, UserRole.ADMIN);
  const products = getAllProducts();
  return { products };
}

export async function action({ request }: ActionFunctionArgs) {
  await requireRole(request, UserRole.ADMIN);

  const formData = await request.formData();
  const action = formData.get("action") as string;
  const productIds = formData.getAll("productIds") as string[];

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));

  switch (action) {
    case "delete":
      return {
        success: true,
        message: `Successfully deleted ${productIds.length} products`,
        action: "delete",
        productIds
      };

    case "feature":
      return {
        success: true,
        message: `Successfully featured ${productIds.length} products`,
        action: "feature",
        productIds
      };

    case "discount":
      const discountPercent = formData.get("discountPercent") as string;
      return {
        success: true,
        message: `Applied ${discountPercent}% discount to ${productIds.length} products`,
        action: "discount",
        productIds,
        discountPercent
      };

    case "bulk-update":
      // Handle bulk field updates
      const updates = [];
      for (const productId of productIds) {
        const price = formData.get(`products[${productId}].price`);
        const stock = formData.get(`products[${productId}].stock`);
        if (price || stock) {
          updates.push({ productId, price, stock });
        }
      }
      return {
        success: true,
        message: `Updated ${updates.length} products`,
        action: "bulk-update",
        updates
      };

    default:
      return { error: "Invalid action" };
  }
}

export default function BulkProductOperations() {
  const { products } = useLoaderData<typeof loader>();
  const bulkFetcher = useFetcher<typeof action>();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("delete");
  const [discountPercent, setDiscountPercent] = useState("10");

  const isProcessing = bulkFetcher.state === "submitting";

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAll = () => {
    setSelectedProducts(products.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedProducts([]);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* RR7 Feature Demo */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <h2 className="text-red-800 font-semibold mb-2">🚀 Bulk Operations Demo</h2>
        <div className="text-red-700 text-sm space-y-1">
          <p><strong>✅ Multiple Form Patterns:</strong> Checkbox selection + bulk actions</p>
          <p><strong>✅ Optimistic Updates:</strong> Immediate feedback with loading states</p>
          <p><strong>✅ Complex Form Data:</strong> Handling arrays and nested objects</p>
          <p><strong>✅ Admin Role Protection:</strong> Server-side authorization</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bulk Product Management</h1>
        <div className="text-sm text-gray-600">
          {selectedProducts.length} of {products.length} selected
        </div>
      </div>

      {/* Success/Error Messages */}
      {bulkFetcher.data?.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-700">✅ {bulkFetcher.data.message}</p>
        </div>
      )}

      {bulkFetcher.data?.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">❌ {bulkFetcher.data.error}</p>
        </div>
      )}

      {/* Bulk Actions Bar */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={selectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Selection
            </button>
          </div>

          {selectedProducts.length > 0 && (
            <bulkFetcher.Form method="post" className="flex items-center space-x-4">
              {selectedProducts.map(id => (
                <input key={id} type="hidden" name="productIds" value={id} />
              ))}

              <select
                name="action"
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="delete">Delete Products</option>
                <option value="feature">Feature Products</option>
                <option value="discount">Apply Discount</option>
              </select>

              {bulkAction === "discount" && (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="discountPercent"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    min="0"
                    max="50"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">% off</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Apply to ${selectedProducts.length} products`
                )}
              </button>
            </bulkFetcher.Form>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length}
                    onChange={(e) => e.target.checked ? selectAll() : clearSelection()}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className={`hover:bg-gray-50 ${selectedProducts.includes(product.id) ? 'bg-blue-50' : ''
                    }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">ID: {product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${product.price}</div>
                    {product.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">${product.originalPrice}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-800' :
                      product.stock > 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Update Form */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Field Updates</h3>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="action" value="bulk-update" />

          {selectedProducts.map(productId => {
            const product = products.find(p => p.id === productId);
            return product ? (
              <div key={productId} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                <input type="hidden" name="productIds" value={productId} />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {product.name}
                  </label>
                  <img src={product.image} alt={product.name} className="h-16 w-16 rounded object-cover" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    name={`products[${productId}].price`}
                    defaultValue={product.price}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    name={`products[${productId}].stock`}
                    defaultValue={product.stock}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => toggleProduct(productId)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : null;
          })}

          {selectedProducts.length > 0 && (
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Update {selectedProducts.length} Products
            </button>
          )}

          {selectedProducts.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              Select products above to enable bulk field updates
            </p>
          )}
        </Form>
      </div>
    </div>
  );
}