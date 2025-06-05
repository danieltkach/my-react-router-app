import { Outlet } from "react-router";
import Header from "./header";
import { ProductCard } from "./product-card";

export default function ShopLayout() {
  return (
    <div>
      <Header />
      <div className="shop-content">
        <Outlet />
      </div>
    </div>
  );
}