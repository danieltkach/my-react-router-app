import { Link } from "react-router";
import { useAuth } from "./auth-context";
import type { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return fallback || (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          🔒 Authentication Required
        </h3>
        <p className="text-yellow-700 mb-4">
          You need to be logged in to access this page.
        </p>
        <Link
          to="/account/login"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block"
        >
          Login to Continue
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
