// app/lib/cart.server.ts - Updated to work with new session system
import type { User } from "~/types/user";
import { logSessionActivity } from "./session-monitor.server";
import { validateSession } from "./session.server";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  maxQuantity: number;
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

// Mock database
const mockCarts = new Map<string, Cart>();
const mockProducts = new Map<string, any>([
  ["1", { id: "1", name: "Premium Wireless Headphones", price: 299.99, stock: 10, image: "https://picsum.photos/100/100?random=1" }],
  ["2", { id: "2", name: "Smart Fitness Watch", price: 199.99, stock: 5, image: "https://picsum.photos/100/100?random=2" }],
  ["3", { id: "3", name: "Bluetooth Speaker", price: 89.99, stock: 15, image: "https://picsum.photos/100/100?random=3" }],
  ["4", { id: "4", name: "Wireless Mouse", price: 49.99, stock: 20, image: "https://picsum.photos/100/100?random=4" }]
]);

export async function getCart(cartId: string): Promise<Cart | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockCarts.get(cartId) || null;
}

// 🎯 UPDATED: Get user cart with session activity logging
export async function getUserCart(user: User, request?: Request): Promise<Cart> {
  await new Promise(resolve => setTimeout(resolve, 100));

  // Look for existing user cart
  for (const [cartId, cart] of mockCarts.entries()) {
    if (cart.userId === user.id) {
      // 🎯 NEW: Log cart access if we have the request
      if (request) {
        const sessionData = await validateSession(request);
        if (sessionData) {
          logSessionActivity(sessionData.sessionId, "cart_accessed", request, {
            cartId: cartId.substring(0, 8) + '...',
            itemCount: cart.itemCount
          });
        }
      }
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

  // 🎯 NEW: Log cart creation
  if (request) {
    const sessionData = await validateSession(request);
    if (sessionData) {
      logSessionActivity(sessionData.sessionId, "cart_created", request, {
        cartId: newCart.id.substring(0, 8) + '...'
      });
    }
  }

  return newCart;
}

// 🎯 UPDATED: Add to cart with activity logging
export async function addToCart(
  cartId: string,
  productId: string,
  quantity: number = 1,
  request?: Request
): Promise<{ success: boolean; error?: string; cart?: Cart; }> {
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

  // 🎯 NEW: Log add to cart activity
  if (request) {
    const sessionData = await validateSession(request);
    if (sessionData) {
      logSessionActivity(sessionData.sessionId, "item_added_to_cart", request, {
        productId,
        productName: product.name,
        quantity,
        cartTotal: cart.total,
        cartItemCount: cart.itemCount
      });
    }
  }

  return { success: true, cart };
}

// 🎯 UPDATED: Update cart item quantity with logging
export async function updateCartItemQuantity(
  cartId: string,
  itemId: string,
  quantity: number,
  request?: Request
): Promise<{ success: boolean; error?: string; cart?: Cart; }> {
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
    return removeFromCart(cartId, itemId, request);
  }

  if (quantity > item.maxQuantity) {
    return { success: false, error: `Only ${item.maxQuantity} items available` };
  }

  const oldQuantity = item.quantity;
  item.quantity = quantity;
  updateCartTotals(cart);

  // 🎯 NEW: Log quantity update
  if (request) {
    const sessionData = await validateSession(request);
    if (sessionData) {
      logSessionActivity(sessionData.sessionId, "cart_quantity_updated", request, {
        itemName: item.name,
        oldQuantity,
        newQuantity: quantity,
        cartTotal: cart.total
      });
    }
  }

  return { success: true, cart };
}

// 🎯 UPDATED: Remove from cart with logging
export async function removeFromCart(
  cartId: string,
  itemId: string,
  request?: Request
): Promise<{ success: boolean; error?: string; cart?: Cart; }> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const cart = mockCarts.get(cartId);
  if (!cart) {
    return { success: false, error: "Cart not found" };
  }

  const itemIndex = cart.items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) {
    return { success: false, error: "Item not found in cart" };
  }

  const removedItem = cart.items[itemIndex];
  cart.items.splice(itemIndex, 1);
  updateCartTotals(cart);

  // 🎯 NEW: Log item removal
  if (request) {
    const sessionData = await validateSession(request);
    if (sessionData) {
      logSessionActivity(sessionData.sessionId, "item_removed_from_cart", request, {
        itemName: removedItem.name,
        quantity: removedItem.quantity,
        cartTotal: cart.total
      });
    }
  }

  return { success: true, cart };
}

// 🎯 UPDATED: Clear cart with logging
export async function clearCart(
  cartId: string,
  request?: Request
): Promise<{ success: boolean; error?: string; cart?: Cart; }> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const cart = mockCarts.get(cartId);
  if (!cart) {
    return { success: false, error: "Cart not found" };
  }

  const itemCount = cart.itemCount;
  cart.items = [];
  updateCartTotals(cart);

  // 🎯 NEW: Log cart clearing
  if (request) {
    const sessionData = await validateSession(request);
    if (sessionData) {
      logSessionActivity(sessionData.sessionId, "cart_cleared", request, {
        itemsRemoved: itemCount
      });
    }
  }

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
