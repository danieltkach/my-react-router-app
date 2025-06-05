import { Outlet, Scripts, Meta, Links } from "react-router";
import "./app.css";

export default function Root() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <nav className="bg-blue-600 text-white p-4">
          <div className="flex space-x-4">
            <a href="/" className="hover:underline">Home</a>
            <a href="/about" className="hover:underline">About</a>
            <a href="/blog" className="hover:underline">Blog</a>
            <a href="/shop" className="hover:underline">Shop</a>
            <a href="/dashboard" className="hover:underline">Dashboard</a>
            <a href="/login" className="hover:underline">Login</a>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          <Outlet />
        </main>
        <Scripts />
      </body>
    </html>
  );
}