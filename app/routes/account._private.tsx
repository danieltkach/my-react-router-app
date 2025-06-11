import { Link, Outlet } from "react-router";
import { useAuth } from "../components/auth-context";
import { AuthGuard } from "../components/auth-guard";

export default function PrivateAccountLayout() {
  const { user, logout } = useAuth();

  return (
    <AuthGuard>
      <div>
        {/* Private Account Navigation */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome back, {user?.name}! 👋
            </h2>
            <span className="text-sm text-green-600 font-medium">
              ✅ Logged In
            </span>
          </div>
          <nav className="flex flex-wrap gap-4">
            <Link
              to="/account/orders"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              📦 My Orders
            </Link>
            <Link
              to="/account/profile"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              👤 My Profile
            </Link>
            <Link
              to="/account/settings"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              ⚙️ Settings
            </Link>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              🚪 Logout
            </button>
          </nav>
        </div>

        {/* Private Content */}
        <Outlet />
      </div>
    </AuthGuard>
  );
}