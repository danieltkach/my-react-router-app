import { Link, useParams } from "react-router";

export async function serverLoader({ params }: { params: { slug: string; }; }) {
  // Simulate fetching blog post data
  return {
    title: `Blog Post: ${params.slug}`,
    content: `This is the content for ${params.slug}`,
    date: "2024-01-15"
  };
}

export default function BlogPost() {
  const params = useParams();

  return (
    <article className="bg-white rounded-lg shadow-sm p-8">
      {/* Post Header */}
      <header className="mb-6 pb-6 border-b">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Blog Post: {params.slug}
        </h1>
        <div className="flex items-center text-gray-600 text-sm">
          <time>January 15, 2024</time>
          <span className="mx-2">•</span>
          <span>5 min read</span>
          <span className="mx-2">•</span>
          <span className="text-blue-600">#technology</span>
        </div>
      </header>

      {/* Post Content */}
      <div className="prose max-w-none">
        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          Reading blog post with slug: <strong>{params.slug}</strong>
        </p>

        <p className="text-gray-700 leading-relaxed mb-4">
          This is a sample blog post demonstrating React Router 7's dynamic routing capabilities.
          The slug parameter "{params.slug}" is captured from the URL and can be used to fetch
          real content from a database or CMS.
        </p>

        <p className="text-gray-700 leading-relaxed mb-4">
          This route demonstrates how file-based routing works with dynamic segments using the
          $ prefix notation. The serverLoader function would typically fetch real blog post
          data based on the slug parameter.
        </p>
      </div>

      {/* Back Link */}
      <div className="mt-8 pt-6 border-t">
        <Link
          to="/blog"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          &lt; Back to Blog
        </Link>
      </div>
    </article>
  );
}