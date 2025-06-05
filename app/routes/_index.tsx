export default function Index() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        Welcome to React Router 7
      </h1>
      <p className="text-gray-700 text-lg mb-6">
        This is the home page demonstrating file-based routing with Tailwind CSS v4.
      </p>
      <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
        <p className="text-blue-800">
          ✅ Tailwind CSS is working! The navigation and this box are styled.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-100 p-4 rounded border border-green-300">
          <h3 className="font-bold text-green-800">Routing Works</h3>
          <p className="text-green-700">File-based routing is active</p>
        </div>
        <div className="bg-purple-100 p-4 rounded border border-purple-300">
          <h3 className="font-bold text-purple-800">Tailwind Works</h3>
          <p className="text-purple-700">Styles are loading properly</p>
        </div>
        <div className="bg-orange-100 p-4 rounded border border-orange-300">
          <h3 className="font-bold text-orange-800">Ready to Go</h3>
          <p className="text-orange-700">Your setup is complete!</p>
        </div>
      </div>
    </div>
  );
}