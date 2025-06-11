import { Link, Outlet } from "react-router";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <nav className="mt-4 flex space-x-6">
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
              Overview
            </Link>
            <Link to="/dashboard/analytics" className="text-gray-600 hover:text-gray-800">
              Analytics
            </Link>
            <Link to="/dashboard/profile" className="text-gray-600 hover:text-gray-800">
              Profile (No Layout)
            </Link>
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
}