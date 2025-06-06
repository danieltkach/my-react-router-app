import { Outlet } from "react-router";

export default function BlogLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blog Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Our Blog</h1>
          <nav className="flex space-x-6">
            <a
              href="/blog"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Latest Posts
            </a>
            <a
              href="/blog/categories"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Categories
            </a>
            <a
              href="/blog/archive"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Archive
            </a>
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