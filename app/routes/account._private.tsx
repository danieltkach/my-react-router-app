import { Outlet } from "react-router";

export default function PrivateAccountLayout() {
  return (
    <div>
      {/* Private Account Navigation */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">My Account Dashboard</h2>
        <nav className="flex flex-wrap gap-4">
          <a
            href="/account/orders"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            📦 My Orders
          </a>
          <a
            href="/account/profile"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            👤 My Profile
          </a>
          <a
            href="/account/settings"
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            ⚙️ Settings
          </a>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            🚪 Logout
          </button>
        </nav>
      </div>

      {/* Private Content */}
      <Outlet />
    </div>
  );
}