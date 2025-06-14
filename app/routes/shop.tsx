import { Outlet } from "react-router";

export default function ShopLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🎯 Teaching Point: This header will appear on most shop pages */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">🛍️ Our Shop</h1>
          <nav className="space-x-6">
            <a href="/shop" className="hover:underline">Home</a>
            <a href="/shop/products" className="hover:underline">Products</a>
            <a href="/shop/cart" className="hover:underline">Cart (2)</a>
            <a href="/shop/account" className="hover:underline">Account</a>
          </nav>
        </div>
      </header>

      {/* 🎯 Teaching Point: Promotional banner - distracting during checkout */}
      <div className="bg-yellow-400 text-yellow-900 px-4 py-2 text-center font-medium">
        🎉 Free shipping on orders over $50! Use code: FREESHIP
      </div>

      {/* 🎯 Teaching Point: This is where child routes render */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* 🎯 Teaching Point: Footer with lots of links - not needed in checkout */}
      <footer className="bg-gray-800 text-white p-8 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#">New Arrivals</a></li>
              <li><a href="#">Best Sellers</a></li>
              <li><a href="#">Sale Items</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Help</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Returns</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#">About</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Press</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Twitter</a></li>
              <li><a href="#">Instagram</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}