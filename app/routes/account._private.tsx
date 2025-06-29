import { Link, Outlet, useLoaderData, Form } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { getCurrentUser, logout } from "~/lib/auth-v2.server";
import { redirect } from "react-router";

// 🎯 Server-side authentication check
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request);
  if (!user) {
    throw redirect("/auth/login");
  }
  return { user };
}

// 🎯 Handle logout action
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  if (formData.get("intent") === "logout") {
    return logout(request, "/auth/login");
  }

  return {};
}

export default function PrivateAccountLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      {/* Private Account Navigation */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome back, {user.name}! 👋
          </h2>
          <span className="text-sm text-green-600 font-medium">
            ✅ Server Auth Working
          </span>
        </div>
        <nav className="flex flex-wrap gap-4">
          <Link
            to="/account/orders"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            📦 My Orders
          </Link>
          <Link
            to="/account/profile"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            👤 My Profile
          </Link>
          <Link
            to="/account/settings"
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            ⚙️ Settings
          </Link>
          <Form method="post" style={{ display: 'inline' }}>
            <input type="hidden" name="intent" value="logout" />
            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              🚪 Logout
            </button>
          </Form>
        </nav>
      </div>

      {/* Private Content */}
      <Outlet />
    </div>
  );
}