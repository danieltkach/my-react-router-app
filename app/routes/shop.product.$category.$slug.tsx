import { Link, useLoaderData, useFetcher } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { getProductBySlug } from "~/lib/products.server";
import ImageGallery from "~/components/shop/image-gallery";
import Reviews from "~/components/shop/reviews";
import RelatedProducts from "~/components/shop/related-products";
import { Breadcrumb } from "~/components/ui/breadcrumb";

export async function loader({ params }: LoaderFunctionArgs) {
  const categorySlug = params.category;
  const productSlug = params.slug; // Changed from params.item

  console.log('Product Detail Loader (new route):', { categorySlug, productSlug });

  if (!categorySlug || !productSlug) {
    throw new Response("Invalid URL", { status: 400 });
  }

  // Get product using centralized data
  const product = getProductBySlug(productSlug);

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  // Verify the category matches
  if (product.categorySlug !== categorySlug) {
    throw new Response("Product not found in this category", { status: 404 });
  }

  console.log('Product loaded successfully (new route):', product.name);
  return { product, categorySlug, productSlug };
}

// 🆕 ONLY ADDITION: Proper TypeScript meta function
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.product) {
    return [
      { title: "Product Not Found | Our Shop" },
      { name: "description", content: "The requested product could not be found." }
    ];
  }

  const { product } = data;

  // Create a dynamic, SEO-optimized title
  const title = `${product.name} - ${product.category} | Our Shop`;

  // Create a rich description with key product info
  const description = `${product.description} Price: $${product.price}. ${product.inStock ? 'In stock' : 'Out of stock'}. Rated ${product.rating}/5 stars by ${product.reviews} customers.`;

  return [
    // Basic meta tags
    { title },
    { name: "description", content: description },
    { name: "keywords", content: `${product.name}, ${product.category}, buy online, ${product.features?.join(', ')}` },

    // Open Graph for social media sharing
    { property: "og:title", content: title },
    { property: "og:description", content: product.description },
    { property: "og:image", content: product.image },
    { property: "og:type", content: "product" },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: product.name },
    { name: "twitter:description", content: product.description },
    { name: "twitter:image", content: product.image }
  ];
};

export default function ProductPage() {
  const { product, categorySlug } = useLoaderData<typeof loader>();
  const addToCartFetcher = useFetcher();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Success: New route structure */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h3 className="text-green-800 font-semibold mb-2">Meta Function Added!</h3>
        <p className="text-green-700 text-sm">
          <strong>URL:</strong> /shop/product/{categorySlug}/{product.slug}<br />
          <strong>Browser Tab:</strong> Shows "{product.name} - {product.category} | Our Shop"<br />
          <strong>TypeScript:</strong> Fully typed with MetaFunction&lt;typeof loader&gt;
        </p>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: "Shop", href: "/shop" },
        { label: product.category, href: `/shop/category/${categorySlug}` },
        { label: product.name }
      ]} />

      {/* Add to Cart Feedback */}
      {addToCartFetcher.data?.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-700">✅ {addToCartFetcher.data.message}</p>
        </div>
      )}

      {addToCartFetcher.data?.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">❌ {addToCartFetcher.data.error}</p>
        </div>
      )}

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Product Images */}
        <div>
          <div className="mb-8">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg shadow-md"
            />
            <div className="mt-4">
              <ImageGallery />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <span className="text-sm text-blue-600 font-medium">{product.category}</span>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <span className="text-lg font-medium text-gray-700 mr-2">
              {product.rating.toFixed(1)} ⭐
            </span>
            <span className="text-gray-600">
              ({product.reviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-blue-600">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.originalPrice && (
              <span className="text-green-600 font-medium">
                Save ${(product.originalPrice - product.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Features</h3>
              <ul className="space-y-1">
                {product.features.map((feature, index) => (
                  <li key={index} className="text-gray-700 flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stock Status */}
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-sm font-medium ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {product.inStock ? `✅ In Stock (${product.stock} available)` : '❌ Out of Stock'}
              </span>
            </div>
          </div>

          {/* Add to Cart Section */}
          <div className="space-y-4">
            <addToCartFetcher.Form method="post" action="/shop/add-to-cart">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="quantity" value="1" />
              <button
                type="submit"
                disabled={!product.inStock || addToCartFetcher.state === "submitting"}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg transition-colors"
              >
                {addToCartFetcher.state === "submitting" ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding to Cart...
                  </span>
                ) : product.inStock ? (
                  "Add to Cart"
                ) : (
                  "Out of Stock"
                )}
              </button>
            </addToCartFetcher.Form>

            <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 font-medium">
              Add to Wishlist ❤️
            </button>
          </div>
        </div>
      </div>

      {/* Additional Components */}
      <Reviews />
      <RelatedProducts />

      {/* Navigation */}
      <div className="mt-12 flex justify-between items-center">
        <Link
          to={`/shop/category/${categorySlug}`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to {product.category} Collection
        </Link>
        <Link
          to="/shop"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Browse All Products →
        </Link>
      </div>
    </div>
  );
}