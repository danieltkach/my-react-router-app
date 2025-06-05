export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4 mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Our Shop</h1>
        <nav className="space-x-4">
          <a href="/shop" className="hover:underline">Home</a>
          <a href="/shop/cart" className="hover:underline">Cart (0)</a>
        </nav>
      </div>
    </header>
  );
}
