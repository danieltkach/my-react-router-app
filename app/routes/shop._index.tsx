import FeaturedProducts from "./shop/components/featured-products";
import HeroBanner from "./shop/components/hero-banner";

export default function ShopHome() {
  return (
    <div>
      <HeroBanner />
      <FeaturedProducts />
    </div>
  );
}