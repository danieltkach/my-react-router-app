import { Form } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { requireUser } from "~/lib/auth.server";
import { logout } from "~/lib/session.server";
import type { Route } from "./+types/dashboard._index";

// 🎯 Teaching Point: Loader requires authentication
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);

  const dashboardData = {
    welcomeMessage: `Welcome back, ${user.name}!`,
    userStats: {
      role: user.role,
      department: user.department,
      permissions: user.permissions.length,
      lastLogin: new Date().toLocaleDateString()
    },
    quickActions: getQuickActionsForRole(user.role)
  };

  return { user, dashboardData };
}

// 🎯 Teaching Point: Action handles logout
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "logout") {
    return logout(request); // Much simpler now
  }

  return {};
}

function getQuickActionsForRole(role: string) {
  const baseActions = [
    { name: "View Profile", href: "/profile", icon: "👤" },
    { name: "Settings", href: "/settings", icon: "⚙️" }
  ];

  if (role === "admin") {
    return [
      ...baseActions,
      { name: "Manage Users", href: "/admin/users", icon: "👥" },
      { name: "System Health", href: "/admin/system", icon: "🔧" },
      { name: "Analytics", href: "/admin/analytics", icon: "📊" }
    ];
  }

  if (role === "manager") {
    return [
      ...baseActions,
      { name: "Team Dashboard", href: "/manager/team", icon: "👥" },
      { name: "Reports", href: "/manager/reports", icon: "📋" }
    ];
  }

  return baseActions;
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { user, dashboardData } = loaderData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with User Info */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">{dashboardData.welcomeMessage}</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.role} • {user.department}</p>
              </div>

              {/* Working Logout Form */}
              <Form method="post">
                <input type="hidden" name="intent" value="logout" />
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  🚪 Logout
                </button>
              </Form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Part 5 Success Demo */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <p className="text-green-700 mb-3">
            This dashboard demonstrates:
          </p>
          <ul className="text-green-700 ml-4 list-disc text-sm">
            <li>✅ Server-side authentication with loaders</li>
            <li>✅ Role-based data loading</li>
            <li>✅ Working logout form action</li>
            <li>✅ Professional error handling</li>
            <li>✅ Loading states and validation</li>
          </ul>
        </div>

        {/* User Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">👤</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Role</dt>
                    <dd className="text-lg font-medium text-gray-900">{dashboardData.userStats.role}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🏢</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Department</dt>
                    <dd className="text-lg font-medium text-gray-900">{dashboardData.userStats.department}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🔐</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Permissions</dt>
                    <dd className="text-lg font-medium text-gray-900">{dashboardData.userStats.permissions}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📅</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Last Login</dt>
                    <dd className="text-lg font-medium text-gray-900">{dashboardData.userStats.lastLogin}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.quickActions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl mr-3">{action.icon}</span>
                  <span className="font-medium text-gray-900">{action.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}