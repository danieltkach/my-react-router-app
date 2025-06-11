import { Link } from "react-router";

export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4 mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Our Shop</h1>
        <nav className="space-x-4">
          <Link to="/shop" className="hover:underline">Home</Link>
          <Link to="/shop/cart" className="hover:underline">Cart (0)</Link>
        </nav>
      </div>
    </header>
  );
}
