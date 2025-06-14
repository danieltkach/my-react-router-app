export default function TestAPI() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test API Endpoints</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Test POST to /api/users</h2>
          <form method="post" action="/api/users" className="space-y-2">
            <input
              name="name"
              placeholder="Name"
              className="border p-2 rounded"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="border p-2 rounded"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Create User
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">API Links</h2>
          <ul className="space-y-1">
            <li><a href="/api/users" className="text-blue-600">GET /api/users</a></li>
            <li><a href="/api/users/1" className="text-blue-600">GET /api/users/1</a></li>
            <li><a href="/rss.xml" className="text-blue-600">GET /rss.xml</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}