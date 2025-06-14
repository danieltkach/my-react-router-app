export default function DashboardHome() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-blue-800 font-semibold mb-2">
          ✅ Dashboard with Full Layout
        </h3>
        <p className="text-blue-700">
          This page uses the complete dashboard layout including:
        </p>
        <ul className="text-blue-700 mt-2 ml-4 list-disc">
          <li>Navigation tabs and controls</li>
          <li>Left sidebar with quick stats</li>
          <li>Footer with refresh controls</li>
        </ul>
      </div>

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
    </div>
  );
}