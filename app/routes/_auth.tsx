import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <Outlet />
        </div>
      </div>
    </div>
  );
}