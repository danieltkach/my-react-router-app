// app/lib/products.server.ts
export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  categorySlug: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stock: number;
  image: string;
  features?: string[];
  badge?: string;
}

// Centralized product database - this eliminates all inconsistencies
export const PRODUCTS: Record<string, Product> = {
  // Electronics
  "premium-wireless-headphones": {
    id: "1",
    name: "Premium Wireless Headphones",
    slug: "premium-wireless-headphones",
    price: 299.99,
    originalPrice: 399.99,
    description: "High-quality wireless headphones with active noise cancellation, premium leather headband, and 30-hour battery life. Perfect for music lovers and professionals.",
    category: "Electronics",
    categorySlug: "electronics",
    rating: 4.8,
    reviews: 124,
    inStock: true,
    stock: 15,
    image: "https://picsum.photos/300/300?random=1",
    badge: "Best Seller",
    features: [
      "Active Noise Cancellation",
      "30-hour battery life",
      "Premium leather headband",
      "Wireless charging case",
      "High-resolution audio"
    ]
  },
  "smart-fitness-watch": {
    id: "2",
    name: "Smart Fitness Watch",
    slug: "smart-fitness-watch",
    price: 199.99,
    originalPrice: 249.99,
    description: "Advanced fitness tracking with heart rate monitoring, GPS, and waterproof design. Track your workouts and monitor your health 24/7.",
    category: "Electronics",
    categorySlug: "electronics",
    rating: 4.6,
    reviews: 89,
    inStock: true,
    stock: 8,
    image: "https://picsum.photos/300/300?random=2",
    badge: "New Arrival",
    features: [
      "Heart rate monitoring",
      "GPS tracking",
      "Waterproof design",
      "7-day battery life",
      "Sleep tracking"
    ]
  },
  "bluetooth-speaker": {
    id: "3",
    name: "Bluetooth Speaker",
    slug: "bluetooth-speaker",
    price: 89.99,
    description: "Portable wireless speaker with excellent sound quality, deep bass, and 12-hour battery life. Perfect for outdoor adventures.",
    category: "Electronics",
    categorySlug: "electronics",
    rating: 4.9,
    reviews: 67,
    inStock: true,
    stock: 15,
    image: "https://picsum.photos/300/300?random=3",
    badge: "Pro Choice",
    features: [
      "360-degree sound",
      "12-hour battery",
      "IPX7 waterproof",
      "Voice assistant support"
    ]
  },
  "wireless-mouse": {
    id: "4",
    name: "Wireless Mouse",
    slug: "wireless-mouse",
    price: 49.99,
    originalPrice: 59.99,
    description: "Ergonomic wireless mouse with precision tracking, customizable buttons, and long-lasting battery.",
    category: "Electronics",
    categorySlug: "electronics",
    rating: 4.7,
    reviews: 156,
    inStock: true,
    stock: 20,
    image: "https://picsum.photos/300/300?random=4",
    badge: "Sale",
    features: [
      "Ergonomic design",
      "Precision tracking",
      "6-month battery life",
      "Customizable buttons"
    ]
  },

  // Clothing
  "cotton-t-shirt": {
    id: "5",
    name: "Cotton T-Shirt",
    slug: "cotton-t-shirt",
    price: 24.99,
    description: "Comfortable 100% cotton t-shirt in various colors. Soft, breathable, and perfect for everyday wear.",
    category: "Clothing",
    categorySlug: "clothing",
    rating: 4.5,
    reviews: 67,
    inStock: true,
    stock: 25,
    image: "https://picsum.photos/300/300?random=5",
    features: [
      "100% cotton",
      "Machine washable",
      "Available in 8 colors",
      "Preshrunk fabric"
    ]
  },
  "denim-jeans": {
    id: "6",
    name: "Denim Jeans",
    slug: "denim-jeans",
    price: 79.99,
    description: "Classic fit denim jeans made from premium cotton. Durable, comfortable, and stylish for any occasion.",
    category: "Clothing",
    categorySlug: "clothing",
    rating: 4.6,
    reviews: 89,
    inStock: true,
    stock: 18,
    image: "https://picsum.photos/300/300?random=6",
    features: [
      "Premium denim",
      "Classic fit",
      "Reinforced stitching",
      "Available in multiple sizes"
    ]
  },
  "sneakers": {
    id: "7",
    name: "Sneakers",
    slug: "sneakers",
    price: 119.99,
    description: "Comfortable running sneakers with modern design, cushioned sole, and breathable mesh upper.",
    category: "Clothing",
    categorySlug: "clothing",
    rating: 4.8,
    reviews: 143,
    inStock: true,
    stock: 12,
    image: "https://picsum.photos/300/300?random=7",
    badge: "Popular",
    features: [
      "Cushioned sole",
      "Breathable mesh",
      "Lightweight design",
      "Non-slip outsole"
    ]
  },

  // Home & Garden
  "coffee-maker": {
    id: "8",
    name: "Coffee Maker",
    slug: "coffee-maker",
    price: 159.99,
    description: "Programmable coffee maker with thermal carafe, brew strength control, and automatic shut-off.",
    category: "Home & Garden",
    categorySlug: "home",
    rating: 4.7,
    reviews: 43,
    inStock: true,
    stock: 12,
    image: "https://picsum.photos/300/300?random=8",
    features: [
      "Programmable timer",
      "Thermal carafe",
      "Brew strength control",
      "Auto shut-off"
    ]
  },
  "table-lamp": {
    id: "9",
    name: "Table Lamp",
    slug: "table-lamp",
    price: 45.99,
    description: "Modern LED table lamp with adjustable brightness, touch control, and USB charging port.",
    category: "Home & Garden",
    categorySlug: "home",
    rating: 4.5,
    reviews: 29,
    inStock: true,
    stock: 8,
    image: "https://picsum.photos/300/300?random=9",
    features: [
      "LED lighting",
      "Touch control",
      "USB charging port",
      "Adjustable brightness"
    ]
  },
  "throw-pillow": {
    id: "10",
    name: "Throw Pillow",
    slug: "throw-pillow",
    price: 19.99,
    description: "Soft decorative throw pillow in multiple colors. Perfect for adding comfort and style to any room.",
    category: "Home & Garden",
    categorySlug: "home",
    rating: 4.3,
    reviews: 67,
    inStock: true,
    stock: 35,
    image: "https://picsum.photos/300/300?random=10",
    features: [
      "Soft fabric",
      "Multiple colors",
      "Machine washable",
      "Hypoallergenic fill"
    ]
  }
};

// Helper functions
export function getAllProducts(): Product[] {
  return Object.values(PRODUCTS);
}

export function getProductBySlug(slug: string): Product | null {
  return PRODUCTS[slug] || null;
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return Object.values(PRODUCTS).filter(
    product => product.categorySlug === categorySlug
  );
}

export function getFeaturedProducts(limit: number = 4): Product[] {
  return Object.values(PRODUCTS)
    .filter(product => product.badge) // Products with badges are featured
    .slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const searchTerm = query.toLowerCase();
  return Object.values(PRODUCTS).filter(product =>
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm)
  );
}