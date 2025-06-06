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
    <div>
      <h1>{params.item}</h1>
      <p>Category: {params.category}</p>
      <ImageGallery />
      <Reviews />
      <RelatedProducts />
    </div>
  );
}