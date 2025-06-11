import { Outlet, NavLink } from "react-router";

export default function BlogLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blog Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Our Blog</h1>
          <nav className="flex space-x-6">
            <NavLink
              to="/blog"
              end
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 font-bold border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-gray-800"
              }
            >
              Latest Posts
            </NavLink>
            <NavLink
              to="/blog/categories"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 font-bold border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-gray-800"
              }
            >
              Categories
            </NavLink>
            <NavLink
              to="/blog/archive"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 font-bold border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-gray-800"
              }
            >
              Archive
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Blog Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}