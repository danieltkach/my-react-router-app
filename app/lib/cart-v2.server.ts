// lib/cart-v2.server.ts - Secure Cart System
import crypto from "crypto";
import { getCurrentUser, requireAuth } from "./auth-v2.server";
import { validateSession } from "./session-v2.server";
import type { SecureCart, CartItem, CartOperation, UserV2, SessionV2 } from "~/types/auth-v2";

// 🎯 MOCK CART DATABASE (Replace with real database later)
const cartStore = new Map<string, SecureCart>();
const cartOperations = new Map<string, CartOperation[]>();

// 🔧 UTILITY FUNCTIONS
function generateCartChecksum(cart: Omit<SecureCart, 'checksum'>): string {
  const data = JSON.stringify({
    items: cart.items,
    total: cart.total,
    itemCount: cart.itemCount
  });
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

function createEmptyCart(cartId: string, userId?: string, sessionId?: string): SecureCart {
  const now = new Date().toISOString();
  const cart: Omit<SecureCart, 'checksum'> = {
    id: cartId,
    userId,
    sessionId: sessionId || "unknown",
    items: [],
    total: 0,
    itemCount: 0,
    currency: "USD",
    createdAt: now,
    updatedAt: now,
    expiresAt: userId ? undefined : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days for guest carts
  };

  return {
    ...cart,
    checksum: generateCartChecksum(cart)
  };
}

function validateCartIntegrity(cart: SecureCart): boolean {
  const { checksum, ...cartWithoutChecksum } = cart;
  const expectedChecksum = generateCartChecksum(cartWithoutChecksum);
  return checksum === expectedChecksum;
}

function logCartOperation(cartId: string, operation: CartOperation): void {
  const operations = cartOperations.get(cartId) || [];
  operations.push(operation);

  // Keep only last 50 operations per cart
  if (operations.length > 50) {
    operations.shift();
  }

  cartOperations.set(cartId, operations);
  console.log(`📝 Cart operation logged: ${operation.type} for cart ${cartId}`);
}

// ======================================
// 🔒 SECURE CART API
// ======================================

/**
 * 🛒 GET SECURE CART: Get cart using signed session (prevents tampering)
 */
export async function getSecureCart(request: Request): Promise<SecureCart> {
  console.log("🛒 Getting secure cart...");

  // Get current user and session
  const user = await getCurrentUser(request);
  const sessionValidation = await validateSession(request);

  if (!sessionValidation.isValid || !sessionValidation.session) {
    // Guest cart - create temporary cart tied to IP/fingerprint
    const guestCartId = `guest-${crypto.createHash('sha256').update(
      (request.headers.get("User-Agent") || "") +
      (request.headers.get("X-Forwarded-For") || "")
    ).digest('hex').substring(0, 8)}`;

    let cart = cartStore.get(guestCartId);
    if (!cart) {
      cart = createEmptyCart(guestCartId);
      cartStore.set(guestCartId, cart);
      console.log(`🛒 Created guest cart: ${guestCartId}`);
    }

    return cart;
  }

  // 🔒 SECURITY: Cart ID comes from signed session, not URL/form data
  const cartId = sessionValidation.session.cartId;

  let cart = cartStore.get(cartId);
  if (!cart) {
    // Create new cart for authenticated user
    cart = createEmptyCart(cartId, user?.id, sessionValidation.session.sessionId);
    cartStore.set(cartId, cart);
    console.log(`🛒 Created authenticated cart: ${cartId} for user: ${user?.id}`);
  }

  // Verify cart integrity
  if (!validateCartIntegrity(cart)) {
    console.error(`🚨 Cart integrity check failed for cart: ${cartId}`);
    // Recreate cart if corrupted
    cart = createEmptyCart(cartId, user?.id, sessionValidation.session.sessionId);
    cartStore.set(cartId, cart);
  }

  return cart;
}

/**
 * 🛒 ADD TO CART: Add product with secure validation
 */
export async function addToCart(
  request: Request,
  productId: string,
  quantity: number = 1
): Promise<{ success: boolean; message?: string; cart?: SecureCart; error?: string; }> {

  console.log(`🛒 Adding to cart: product ${productId}, qty ${quantity}`);

  try {
    // Validate input
    if (!productId || quantity <= 0 || quantity > 10) {
      return { success: false, error: "Invalid product or quantity" };
    }

    // Get secure cart
    const cart = await getSecureCart(request);

    // Mock product lookup (replace with real product database)
    const mockProducts = {
      "1": { name: "Premium Wireless Headphones", price: 299.99, maxStock: 15 },
      "2": { name: "Smart Fitness Watch", price: 199.99, maxStock: 8 },
      "3": { name: "Bluetooth Speaker", price: 89.99, maxStock: 15 },
      "4": { name: "Wireless Mouse", price: 49.99, maxStock: 20 }
    };

    const product = mockProducts[productId as keyof typeof mockProducts];
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingItemIndex >= 0) {
      // Update existing item
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > product.maxStock) {
        return {
          success: false,
          error: `Cannot add more items. Maximum stock: ${product.maxStock}`
        };
      }

      cart.items[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new item
      if (quantity > product.maxStock) {
        return {
          success: false,
          error: `Cannot add ${quantity} items. Maximum stock: ${product.maxStock}`
        };
      }

      const newItem: CartItem = {
        id: crypto.randomUUID(),
        productId,
        name: product.name,
        price: product.price,
        quantity,
        maxQuantity: product.maxStock,
        image: `https://picsum.photos/300/300?random=${productId}`,
        category: "electronics",
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      cart.items.push(newItem);
    }

    // Recalculate totals
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.updatedAt = new Date().toISOString();

    // Update checksum for integrity
    const { checksum, ...cartWithoutChecksum } = cart;
    cart.checksum = generateCartChecksum(cartWithoutChecksum);

    // Save cart
    cartStore.set(cart.id, cart);

    // Log operation
    logCartOperation(cart.id, {
      type: 'add',
      productId,
      quantity,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ Added to cart: ${product.name} x${quantity}`);

    return {
      success: true,
      message: `Added ${product.name} to cart`,
      cart
    };

  } catch (error) {
    console.error("🚨 Add to cart error:", error);
    return { success: false, error: "Failed to add item to cart" };
  }
}

/**
 * 🛒 UPDATE CART ITEM: Update quantity with validation
 */
export async function updateCartItemQuantity(
  request: Request,
  itemId: string,
  newQuantity: number
): Promise<{ success: boolean; message?: string; cart?: SecureCart; error?: string; }> {

  console.log(`🛒 Updating cart item: ${itemId} to quantity ${newQuantity}`);

  try {
    if (newQuantity < 0 || newQuantity > 10) {
      return { success: false, error: "Invalid quantity" };
    }

    const cart = await getSecureCart(request);
    const itemIndex = cart.items.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return { success: false, error: "Item not found in cart" };
    }

    const item = cart.items[itemIndex];

    if (newQuantity === 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
      logCartOperation(cart.id, {
        type: 'remove',
        productId: item.productId,
        timestamp: new Date().toISOString()
      });
    } else {
      // Update quantity
      if (newQuantity > item.maxQuantity) {
        return {
          success: false,
          error: `Maximum quantity available: ${item.maxQuantity}`
        };
      }

      cart.items[itemIndex] = {
        ...item,
        quantity: newQuantity,
        updatedAt: new Date().toISOString()
      };

      logCartOperation(cart.id, {
        type: 'update',
        productId: item.productId,
        quantity: newQuantity,
        timestamp: new Date().toISOString()
      });
    }

    // Recalculate totals
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.updatedAt = new Date().toISOString();

    // Update checksum
    const { checksum, ...cartWithoutChecksum } = cart;
    cart.checksum = generateCartChecksum(cartWithoutChecksum);

    cartStore.set(cart.id, cart);

    return {
      success: true,
      message: newQuantity === 0 ? "Item removed from cart" : "Cart updated",
      cart
    };

  } catch (error) {
    console.error("🚨 Update cart error:", error);
    return { success: false, error: "Failed to update cart" };
  }
}

/**
 * 🛒 CLEAR CART: Empty cart securely
 */
export async function clearCart(request: Request): Promise<{ success: boolean; message?: string; error?: string; }> {
  console.log("🛒 Clearing cart...");

  try {
    const cart = await getSecureCart(request);

    cart.items = [];
    cart.itemCount = 0;
    cart.total = 0;
    cart.updatedAt = new Date().toISOString();

    // Update checksum
    const { checksum, ...cartWithoutChecksum } = cart;
    cart.checksum = generateCartChecksum(cartWithoutChecksum);

    cartStore.set(cart.id, cart);

    logCartOperation(cart.id, {
      type: 'clear',
      timestamp: new Date().toISOString()
    });

    return { success: true, message: "Cart cleared successfully" };

  } catch (error) {
    console.error("🚨 Clear cart error:", error);
    return { success: false, error: "Failed to clear cart" };
  }
}

/**
 * 🔄 TRANSFER GUEST CART: Move guest cart to authenticated user
 */
export async function transferGuestCart(request: Request, guestCartId: string): Promise<boolean> {
  console.log(`🔄 Transferring guest cart: ${guestCartId}`);

  try {
    const { user, session } = await requireAuth(request);
    const guestCart = cartStore.get(guestCartId);

    if (!guestCart || guestCart.items.length === 0) {
      return false; // Nothing to transfer
    }

    const userCart = await getSecureCart(request);

    // Merge items from guest cart
    for (const guestItem of guestCart.items) {
      const existingItemIndex = userCart.items.findIndex(item => item.productId === guestItem.productId);

      if (existingItemIndex >= 0) {
        // Merge quantities
        const existingItem = userCart.items[existingItemIndex];
        const newQuantity = Math.min(
          existingItem.quantity + guestItem.quantity,
          guestItem.maxQuantity
        );

        userCart.items[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          updatedAt: new Date().toISOString()
        };
      } else {
        // Add guest item to user cart
        userCart.items.push({
          ...guestItem,
          id: crypto.randomUUID(), // New ID for user cart
          updatedAt: new Date().toISOString()
        });
      }
    }

    // Recalculate totals
    userCart.itemCount = userCart.items.reduce((sum, item) => sum + item.quantity, 0);
    userCart.total = userCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    userCart.updatedAt = new Date().toISOString();

    // Update checksum
    const { checksum, ...cartWithoutChecksum } = userCart;
    userCart.checksum = generateCartChecksum(cartWithoutChecksum);

    cartStore.set(userCart.id, userCart);
    cartStore.delete(guestCartId); // Remove guest cart

    console.log(`✅ Transferred ${guestCart.items.length} items from guest cart to user cart`);
    return true;

  } catch (error) {
    console.error("🚨 Transfer cart error:", error);
    return false;
  }
}

// ======================================
// 🧪 DEVELOPMENT & MONITORING
// ======================================

export function getCartStats() {
  const carts = Array.from(cartStore.values());

  return {
    totalCarts: carts.length,
    guestCarts: carts.filter(c => !c.userId).length,
    userCarts: carts.filter(c => !!c.userId).length,
    totalItems: carts.reduce((sum, c) => sum + c.itemCount, 0),
    totalValue: carts.reduce((sum, c) => sum + c.total, 0),
    averageCartValue: carts.length > 0 ? carts.reduce((sum, c) => sum + c.total, 0) / carts.length : 0
  };
}

export function debugCart(cartId: string) {
  if (process.env.NODE_ENV !== "development") return;

  const cart = cartStore.get(cartId);
  const operations = cartOperations.get(cartId) || [];

  console.log("🔍 Cart Debug:", {
    cart,
    operations: operations.slice(-10), // Last 10 operations
    isIntegrityValid: cart ? validateCartIntegrity(cart) : false
  });
}
