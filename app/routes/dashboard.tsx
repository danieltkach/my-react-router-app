import { Outlet, NavLink } from "react-router";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <nav className="mt-4 flex space-x-6">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 font-bold border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-gray-800"
              }
            >
              Overview
            </NavLink>
            <NavLink
              to="/dashboard/analytics"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 font-bold border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-gray-800"
              }
            >
              Analytics
            </NavLink>
            <NavLink
              to="/dashboard/profile"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 font-bold border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-gray-800"
              }
            >
              Profile (No Layout)
            </NavLink>
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
}