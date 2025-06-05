import { useParams } from "react-router";
import ImageGallery from "./shop/$category.$item/image-gallery";
import Reviews from "./shop/$category.$item/reviews";
import RelatedProducts from "./shop/$category.$item/related-products";


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