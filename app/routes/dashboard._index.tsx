export default function DashboardHome() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Sales</h3>
          <p className="text-3xl font-bold text-blue-600">$12,345</p>
          <p className="text-sm text-green-600">+12% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Orders</h3>
          <p className="text-3xl font-bold text-purple-600">1,234</p>
          <p className="text-sm text-green-600">+8% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Customers</h3>
          <p className="text-3xl font-bold text-green-600">5,678</p>
          <p className="text-sm text-green-600">+15% from last month</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span>New order from John Doe</span>
            <span className="text-sm text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span>Product "Wireless Headphones" low in stock</span>
            <span className="text-sm text-gray-500">1 hour ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span>Payment received for Order #1234</span>
            <span className="text-sm text-gray-500">3 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}