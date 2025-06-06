import { useParams } from "react-router";
import ImageGallery from "../components/shop/image-gallery";
import Reviews from "../components/shop/reviews";
import RelatedProducts from "../components/shop/related-products";

export async function serverLoader({ params }: { params: { category: string; item: string; }; }) {
  return {
    product: {
      name: `${params.item} in ${params.category}`,
      price: 299.99,
      description: "Amazing product description"
    }
  };
}

export default function ProductPage() {
  const params = useParams();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {params.item}
      </h1>
      <p className="text-gray-600 mb-6">Category: {params.category}</p>

      <ImageGallery />
      <Reviews />
      <RelatedProducts />

      <div className="mt-8">
        <a href="/shop" className="text-blue-600 hover:underline">
          &lt; Back to Shop
        </a>
      </div>
    </div>
  );
}