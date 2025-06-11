import { Link, useParams } from "react-router";

export async function serverLoader({ params }: { params: { userId: string; }; }) {
  // Simulate fetching user data
  const userId = params.userId;

  // Mock user data based on ID
  const userData = {
    "123": {
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      avatar: "https://picsum.photos/150/150?random=1",
      role: "Senior Developer",
      location: "San Francisco, CA",
      joinDate: "January 2022",
      bio: "Passionate full-stack developer with 8 years of experience building scalable web applications.",
      stats: { posts: 42, followers: 1234, following: 567 },
      skills: ["React", "TypeScript", "Node.js", "Python", "AWS"]
    },
    "456": {
      name: "Michael Chen",
      email: "michael.chen@example.com",
      avatar: "https://picsum.photos/150/150?random=2",
      role: "UX Designer",
      location: "New York, NY",
      joinDate: "March 2021",
      bio: "Creative designer focused on user-centered design and accessibility.",
      stats: { posts: 28, followers: 890, following: 234 },
      skills: ["Figma", "Adobe XD", "User Research", "Prototyping", "CSS"]
    },
    "789": {
      name: "Emily Rodriguez",
      email: "emily.rodriguez@example.com",
      avatar: "https://picsum.photos/150/150?random=3",
      role: "Product Manager",
      location: "Austin, TX",
      joinDate: "August 2020",
      bio: "Product strategist with a passion for building products that solve real user problems.",
      stats: { posts: 35, followers: 2156, following: 345 },
      skills: ["Product Strategy", "Analytics", "Agile", "User Research", "SQL"]
    }
  };

  return {
    user: userData[userId as keyof typeof userData] || null,
    userId
  };
}

export default function UserProfile() {
  const params = useParams();
  const userId = params.userId;

  // Mock user data for client-side rendering
  const userData = {
    "123": {
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      avatar: "https://picsum.photos/150/150?random=1",
      role: "Senior Developer",
      location: "San Francisco, CA",
      joinDate: "January 2022",
      bio: "Passionate full-stack developer with 8 years of experience building scalable web applications.",
      stats: { posts: 42, followers: 1234, following: 567 },
      skills: ["React", "TypeScript", "Node.js", "Python", "AWS"]
    },
    "456": {
      name: "Michael Chen",
      email: "michael.chen@example.com",
      avatar: "https://picsum.photos/150/150?random=2",
      role: "UX Designer",
      location: "New York, NY",
      joinDate: "March 2021",
      bio: "Creative designer focused on user-centered design and accessibility.",
      stats: { posts: 28, followers: 890, following: 234 },
      skills: ["Figma", "Adobe XD", "User Research", "Prototyping", "CSS"]
    },
    "789": {
      name: "Emily Rodriguez",
      email: "emily.rodriguez@example.com",
      avatar: "https://picsum.photos/150/150?random=3",
      role: "Product Manager",
      location: "Austin, TX",
      joinDate: "August 2020",
      bio: "Product strategist with a passion for building products that solve real user problems.",
      stats: { posts: 35, followers: 2156, following: 345 },
      skills: ["Product Strategy", "Analytics", "Agile", "User Research", "SQL"]
    }
  };

  const user = userData[userId as keyof typeof userData];

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <p className="text-gray-600 mb-6">
            Sorry, we couldn't find a user with ID: <strong>{userId}</strong>
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Try these sample user IDs:</p>
            <div className="flex justify-center space-x-4">
              <Link to="/users/123" className="text-blue-600 hover:underline">123</Link>
              <Link to="/users/456" className="text-blue-600 hover:underline">456</Link>
              <Link to="/users/789" className="text-blue-600 hover:underline">789</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-32 h-32 rounded-full object-cover"
          />

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
            <p className="text-xl text-blue-600 mb-2">{user.role}</p>
            <p className="text-gray-600 mb-4">{user.location}</p>

            <div className="flex justify-center md:justify-start space-x-6 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{user.stats.posts}</div>
                <div className="text-sm text-gray-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{user.stats.followers.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{user.stats.following}</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
            </div>

            <div className="flex justify-center md:justify-start space-x-4">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Follow
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50">
                Message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bio & Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed">{user.bio}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Info</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Email</span>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Member Since</span>
                <p className="text-gray-900">{user.joinDate}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">User ID</span>
                <p className="text-gray-900 font-mono">{userId}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Try Other Users</h3>
            <div className="space-y-2">
              <Link to="/users/123" className="block text-blue-600 hover:underline">User 123 - Sarah</Link>
              <Link to="/users/456" className="block text-blue-600 hover:underline">User 456 - Michael</Link>
              <Link to="/users/789" className="block text-blue-600 hover:underline">User 789 - Emily</Link>
              <Link to="/users/999" className="block text-blue-600 hover:underline">User 999 - Not Found</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}