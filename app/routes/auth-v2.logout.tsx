// routes/auth-v2.logout.tsx - Modern Logout (Server-only)
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { logout, logoutAllDevices } from "~/lib/auth-v2.server";

// 🔍 LOADER: Handle GET requests (direct navigation to logout)
export async function loader({ request }: LoaderFunctionArgs) {
  console.log("🚪 Direct logout request");
  return await logout(request, "/auth-v2/login");
}

// 🎯 ACTION: Handle POST requests (form-based logout)
export async function action({ request }: ActionFunctionArgs) {
  console.log("🚪 Form logout request");

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "logout-all-devices") {
    console.log("🧹 Logging out all devices");
    return await logoutAllDevices(request);
  }

  // Regular logout
  return await logout(request, "/auth-v2/login");
}

// ✅ ADD: Default export to satisfy React Router
export default function LogoutPage() {
  // This component should never render since loader/action redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Logging out...</h1>
        <p className="text-gray-600">Please wait while we log you out.</p>
      </div>
    </div>
  );
}
