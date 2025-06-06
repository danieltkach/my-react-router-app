import { Outlet } from "react-router";
import Header from "../components/shop/header";

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