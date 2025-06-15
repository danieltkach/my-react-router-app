import type { User } from "~/types/user";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  maxQuantity: number; // inventory limit
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

// 🎯 Teaching Point: Mock database - replace with real DB
const mockCarts = new Map<string, Cart>();
const mockProducts = new Map<string, any>([
  ["1", { id: "1", name: "Premium Wireless Headphones", price: 299.99, stock: 10, image: "https://picsum.photos/100/100?random=1" }],
  ["2", { id: "2", name: "Smart Fitness Watch", price: 199.99, stock: 5, image: "https://picsum.photos/100/100?random=2" }],
  ["3", { id: "3", name: "Bluetooth Speaker", price: 89.99, stock: 15, image: "https://picsum.photos/100/100?random=3" }],
  ["4", { id: "4", name: "Wireless Mouse", price: 49.99, stock: 20, image: "https://picsum.photos/100/100?random=4" }]
]);

export async function getCart(cartId: string): Promise<Cart | null> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate DB
  return mockCarts.get(cartId) || null;
}

export async function getUserCart(user: User): Promise<Cart> {
  await new Promise(resolve => setTimeout(resolve, 100));

  // Look for existing user cart
  for (const [cartId, cart] of mockCarts.entries()) {
    if (cart.userId === user.id) {
      return cart;
    }
  }

  // Create new cart for user
  const newCart: Cart = {
    id: `cart_${user.id}_${Date.now()}`,
    userId: user.id,
    items: [],
    total: 0,
    itemCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  mockCarts.set(newCart.id, newCart);
  return newCart;
}

export async function addToCart(cartId: string, productId: string, quantity: number = 1): Promise<{ success: boolean; error?: string; cart?: Cart; }> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const cart = mockCarts.get(cartId);
  if (!cart) {
    return { success: false, error: "Cart not found" };
  }

  const product = mockProducts.get(productId);
  if (!product) {
    return { success: false, error: "Product not found" };
  }

  // Check if item already in cart
  const existingItem = cart.items.find(item => item.productId === productId);

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > product.stock) {
      return { success: false, error: `Only ${product.stock} items available` };
    }
    existingItem.quantity = newQuantity;
  } else {
    if (quantity > product.stock) {
      return { success: false, error: `Only ${product.stock} items available` };
    }

    cart.items.push({
      id: `item_${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
      maxQuantity: product.stock
    });
  }

  updateCartTotals(cart);
  return { success: true, cart };
}

export async function updateCartItemQuantity(cartId: string, itemId: string, quantity: number): Promise<{ success: boolean; error?: string; cart?: Cart; }> {
  await new Promise(resolve => setTimeout(resolve, 150));

  const cart = mockCarts.get(cartId);
  if (!cart) {
    return { success: false, error: "Cart not found" };
  }

  const item = cart.items.find(i => i.id === itemId);
  if (!item) {
    return { success: false, error: "Item not found in cart" };
  }

  if (quantity <= 0) {
    return removeFromCart(cartId, itemId);
  }

  if (quantity > item.maxQuantity) {
    return { success: false, error: `Only ${item.maxQuantity} items available` };
  }

  item.quantity = quantity;
  updateCartTotals(cart);

  return { success: true, cart };
}

export async function removeFromCart(cartId: string, itemId: string): Promise<{ success: boolean; error?: string; cart?: Cart; }> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const cart = mockCarts.get(cartId);
  if (!cart) {
    return { success: false, error: "Cart not found" };
  }

  const itemIndex = cart.items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) {
    return { success: false, error: "Item not found in cart" };
  }

  cart.items.splice(itemIndex, 1);
  updateCartTotals(cart);

  return { success: true, cart };
}

export async function clearCart(cartId: string): Promise<{ success: boolean; error?: string; cart?: Cart; }> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const cart = mockCarts.get(cartId);
  if (!cart) {
    return { success: false, error: "Cart not found" };
  }

  cart.items = [];
  updateCartTotals(cart);

  return { success: true, cart };
}

function updateCartTotals(cart: Cart): void {
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.updatedAt = new Date().toISOString();
}

export async function getProducts() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return Array.from(mockProducts.values());
}
