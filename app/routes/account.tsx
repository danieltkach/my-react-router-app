import { Outlet } from "react-router";

export default function AccountLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Account Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Account Center</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
}