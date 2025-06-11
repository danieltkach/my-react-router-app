import { Outlet, Scripts, Meta, Links, Link } from "react-router";
import { AuthProvider } from "./components/auth-context";
import "./app.css";

export default function Root() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <AuthProvider>
          <nav className="bg-blue-600 text-white p-4">
            <div className="flex space-x-4">
              <Link to="/" className="hover:underline">Home</Link>
              <Link to="/about" className="hover:underline">About</Link>
              <Link to="/blog" className="hover:underline">Blog</Link>
              <Link to="/shop" className="hover:underline">Shop</Link>
              <Link to="/dashboard" className="hover:underline">Dashboard</Link>
              <Link to="/account/login" className="hover:underline">Account</Link>
            </div>
          </nav>
          <main className="container mx-auto p-4">
            <Outlet />
          </main>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}