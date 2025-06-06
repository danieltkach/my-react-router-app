export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We're passionate about building amazing web experiences with modern technologies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            We believe in creating web applications that are not only functional but also
            delightful to use. Our focus is on modern development practices, clean code,
            and user-centered design.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              Innovation and continuous learning
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              Quality over quantity
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              User-first approach
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              Open collaboration
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">React Router 7 Demo</h2>
        <p className="text-gray-700 mb-6">
          This site demonstrates React Router 7's file-based routing system with various
          routing patterns including dynamic segments, nested routes, and layout routes.
        </p>
        <a
          href="/blog"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
        >
          Read Our Blog
        </a>
      </div>
    </div>
  );
}