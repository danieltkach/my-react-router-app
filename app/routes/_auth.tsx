import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <h1>Authentication</h1>
        <Outlet />
      </div>
    </div>
  );
}