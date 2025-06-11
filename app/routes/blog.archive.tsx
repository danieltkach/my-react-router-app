import { Link } from "react-router";

export default function BlogArchive() {
  const archiveData = [
    {
      year: 2024,
      months: [
        {
          name: "January", count: 5, posts: [
            { title: "Getting Started with React Router 7", slug: "getting-started-with-react-router-7", date: "Jan 15" },
            { title: "Building Modern Web Apps", slug: "building-modern-web-apps", date: "Jan 12" },
            { title: "Advanced Tailwind CSS Tips", slug: "tailwind-css-tips", date: "Jan 10" },
            { title: "JavaScript ES2024 Features", slug: "javascript-es2024-features", date: "Jan 8" },
            { title: "React Performance Optimization", slug: "react-performance-optimization", date: "Jan 5" }
          ]
        },
        {
          name: "December", count: 3, posts: [
            { title: "Year in Review: Web Development 2023", slug: "year-in-review-2023", date: "Dec 28" },
            { title: "CSS Grid vs Flexbox in 2024", slug: "css-grid-vs-flexbox-2024", date: "Dec 20" },
            { title: "Node.js Best Practices", slug: "nodejs-best-practices", date: "Dec 15" }
          ]
        },
        {
          name: "November", count: 4, posts: [
            { title: "TypeScript Advanced Patterns", slug: "typescript-advanced-patterns", date: "Nov 25" },
            { title: "Building Accessible Web Apps", slug: "building-accessible-web-apps", date: "Nov 18" },
            { title: "API Design Best Practices", slug: "api-design-best-practices", date: "Nov 10" },
            { title: "React Testing Library Guide", slug: "react-testing-library-guide", date: "Nov 5" }
          ]
        }
      ]
    },
    {
      year: 2023,
      months: [
        { name: "December", count: 6, posts: [] },
        { name: "November", count: 4, posts: [] },
        { name: "October", count: 8, posts: [] }
      ]
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog Archive</h2>
        <p className="text-gray-600">Browse our complete post history</p>
      </div>

      <div className="space-y-8">
        {archiveData.map((yearData) => (
          <div key={yearData.year} className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">{yearData.year}</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {yearData.months.map((month) => (
                <div key={month.name} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">{month.name} {yearData.year}</h4>
                    <span className="text-sm text-gray-500">{month.count} posts</span>
                  </div>

                  {month.posts.length > 0 ? (
                    <div className="space-y-2">
                      {month.posts.map((post) => (
                        <div key={post.slug} className="border-l-2 border-blue-200 pl-3">
                          <Link
                            to={`/blog/post/${post.slug}`}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium block"
                          >
                            {post.title}
                          </Link>
                          <span className="text-xs text-gray-500">{post.date}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">View all posts →</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}