export default function BlogCategories() {
  const categories = [
    {
      name: "Tutorial",
      count: 12,
      description: "Step-by-step guides and tutorials",
      color: "bg-blue-100 text-blue-800"
    },
    {
      name: "Development",
      count: 8,
      description: "Web development tips and best practices",
      color: "bg-green-100 text-green-800"
    },
    {
      name: "CSS",
      count: 6,
      description: "Styling and design techniques",
      color: "bg-purple-100 text-purple-800"
    },
    {
      name: "React",
      count: 15,
      description: "React.js tips, tricks, and tutorials",
      color: "bg-cyan-100 text-cyan-800"
    },
    {
      name: "JavaScript",
      count: 10,
      description: "Modern JavaScript techniques and features",
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      name: "Design",
      count: 4,
      description: "UI/UX design principles and trends",
      color: "bg-pink-100 text-pink-800"
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog Categories</h2>
        <p className="text-gray-600">Browse articles by topic</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.name} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${category.color}`}>
                {category.count} posts
              </span>
            </div>

            <p className="text-gray-600 mb-4">{category.description}</p>

            <a
              href={`/blog/category/${category.name.toLowerCase()}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View Posts →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}