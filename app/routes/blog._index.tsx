export default function BlogHome() {
  const posts = [
    {
      slug: "getting-started-with-react-router-7",
      title: "Getting Started with React Router 7",
      excerpt: "Learn about the new file-based routing system in React Router 7",
      date: "2024-01-15",
      readTime: "5 min read",
      category: "Tutorial"
    },
    {
      slug: "building-modern-web-apps",
      title: "Building Modern Web Applications",
      excerpt: "Best practices for creating scalable and maintainable web applications",
      date: "2024-01-12",
      readTime: "8 min read",
      category: "Development"
    },
    {
      slug: "tailwind-css-tips",
      title: "Advanced Tailwind CSS Tips",
      excerpt: "Take your Tailwind CSS skills to the next level with these pro tips",
      date: "2024-01-10",
      readTime: "6 min read",
      category: "CSS"
    }
  ];

  return (
    <div className="mx-4"> {/* Add horizontal margin to the container */}
      <div className="mb-12"> {/* Increase header margin */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Latest Posts</h2>
        <p className="text-gray-600">Discover our latest articles and tutorials</p>
      </div>

      <div className="space-y-6"> {/* Much larger spacing between cards */}
        {posts.map((post) => (
          <article key={post.slug} className="bg-white rounded-lg shadow-lg p-12 hover:shadow-xl transition-shadow mx-4"> {/* Much larger padding and margin */}
            <div className="flex items-center text-sm text-gray-500 mb-6"> {/* Larger margin */}
              <time>{post.date}</time>
              <span className="mx-2">•</span>
              <span>{post.readTime}</span>
              <span className="mx-2">•</span>
              <span className="text-blue-600">{post.category}</span>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-6"> {/* Larger text and margin */}
              <a
                href={`/blog/post/${post.slug}`}
                className="hover:text-blue-600 transition-colors"
              >
                {post.title}
              </a>
            </h3>

            <p className="text-gray-700 mb-8 leading-relaxed text-lg">{post.excerpt}</p> {/* Larger margin and text */}

            <a
              href={`/blog/post/${post.slug}`}
              className="text-blue-600 hover:text-blue-800 font-medium text-lg"
            >
              Read more →
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}