import { Outlet, NavLink } from "react-router";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🎯 Teaching Point: Complex dashboard navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Last updated: 2 min ago</span>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                📊 Generate Report
              </button>
            </div>
          </div>

          {/* Dashboard Navigation */}
          <nav className="flex space-x-6">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 font-bold border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-gray-800"
              }
            >
              📈 Overview
            </NavLink>
            <NavLink
              to="/dashboard/analytics"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 font-bold border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-gray-800"
              }
            >
              📊 Analytics
            </NavLink>
            <NavLink
              to="/dashboard/reports"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 font-bold border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-gray-800"
              }
            >
              📋 Reports
            </NavLink>
            <NavLink
              to="/dashboard/export"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 font-bold border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-gray-800"
              }
            >
              📤 Export (No Layout)
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Sidebar with widgets */}
      <div className="flex">
        <aside className="w-64 bg-white shadow-sm min-h-screen p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-sm text-blue-600">Total Users</div>
              <div className="text-xl font-bold text-blue-800">12,345</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-sm text-green-600">Revenue</div>
              <div className="text-xl font-bold text-green-800">$98,765</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="text-sm text-purple-600">Conversions</div>
              <div className="text-xl font-bold text-purple-800">23.4%</div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>

      {/* 🎯 Teaching Point: Dashboard footer with lots of controls */}
      <footer className="bg-white border-t p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Data refreshes automatically every 5 minutes
          </div>
          <div className="flex space-x-4">
            <button className="text-sm text-gray-600 hover:text-gray-800">🔄 Refresh</button>
            <button className="text-sm text-gray-600 hover:text-gray-800">⚙️ Settings</button>
            <button className="text-sm text-gray-600 hover:text-gray-800">❓ Help</button>
          </div>
        </div>
      </footer>
    </div>
  );
}