import { Outlet } from "react-router";

export default function PublicAccountLayout() {
  return (
    <div>
      {/* Public Account Navigation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Account Access</h2>
        <nav className="flex flex-wrap gap-4">
          <a
            href="/account/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Login
          </a>
          <a
            href="/account/register"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Sign Up
          </a>
          <a
            href="/account/perks"
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Member Perks
          </a>
        </nav>
      </div>

      {/* Public Content */}
      <Outlet />
    </div>
  );
}