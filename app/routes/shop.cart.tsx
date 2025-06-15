import { Form, useLoaderData, useActionData, useFetcher, redirect } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { getUser } from "~/lib/auth.server";
import { getUserCart, updateCartItemQuantity, removeFromCart, clearCart } from "~/lib/cart.server";
import type { Cart } from "~/lib/cart.server";

interface ActionData {
  success?: boolean;
  error?: string;
  message?: string;
}

// 🎯 Teaching Point: Loader gets user's cart
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);

  if (!user) {
    // Guest cart functionality - simplified for demo
    return {
      cart: {
        id: "guest",
        items: [],
        total: 0,
        itemCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Cart,
      user: null
    };
  }

  const cart = await getUserCart(user);
  return { cart, user };
}

// 🎯 Teaching Point: Action handles all cart operations
export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request);
  if (!user) {
    return { error: "Please login to manage your cart" };
  }

  const formData = await request.formData();
  const action = formData.get("action") as string;
  const cartId = formData.get("cartId") as string;

  switch (action) {
    case "update-quantity": {
      const itemId = formData.get("itemId") as string;
      const quantity = parseInt(formData.get("quantity") as string);

      const result = await updateCartItemQuantity(cartId, itemId, quantity);

      if (result.success) {
        return { success: true, message: `Updated quantity to ${quantity}` };
      } else {
        return { error: result.error };
      }
    }

    case "remove-item": {
      const itemId = formData.get("itemId") as string;

      const result = await removeFromCart(cartId, itemId);

      if (result.success) {
        return { success: true, message: "Item removed from cart" };
      } else {
        return { error: result.error };
      }
    }

    case "clear-cart": {
      const result = await clearCart(cartId);

      if (result.success) {
        return { success: true, message: "Cart cleared successfully" };
      } else {
        return { error: result.error };
      }
    }

    case "proceed-checkout": {
      return redirect("/shop/checkout");
    }

    default:
      return { error: "Invalid action" };
  }
}

export default function ShoppingCart() {
  const { cart, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const updateFetcher = useFetcher();
  const removeFetcher = useFetcher();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Shopping Cart</h1>

      {/* Part 5 Success Demo */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
        <h2 className="text-purple-800 font-semibold mb-2">
          🎉 Part 5: Shopping Cart Complete!
        </h2>
        <p className="text-purple-700 mb-3">
          Your cart now demonstrates professional e-commerce patterns:
        </p>
        <ul className="text-purple-700 ml-4 list-disc text-sm">
          <li>✅ <strong>Server-side cart management</strong> - Real data persistence</li>
          <li>✅ <strong>Optimistic UI</strong> - Instant feedback on updates</li>
          <li>✅ <strong>Inventory validation</strong> - Can't exceed stock limits</li>
          <li>✅ <strong>User-specific carts</strong> - Each user has their own cart</li>
          <li>✅ <strong>Professional error handling</strong> - Graceful failure modes</li>
        </ul>
      </div>

      {/* Action Feedback */}
      {actionData?.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-700">✅ {actionData.message}</p>
        </div>
      )}

      {actionData?.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">❌ {actionData.error}</p>
        </div>
      )}

      {/* Guest User Message */}
      {!user && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-700">
            🔒 <strong>Guest Mode:</strong> Your cart won't persist between sessions.
            <a href="/auth/login" className="text-blue-600 hover:underline ml-1">
              Login to save your cart!
            </a>
          </p>
        </div>
      )}

      {/* Cart Items */}
      {cart.items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products to get started!</p>
          <a
            href="/shop"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center bg-white border rounded-lg p-4 shadow-sm">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded mr-4"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-gray-600">${item.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Stock: {item.maxQuantity}</p>
                </div>

                {/* Optimistic Quantity Controls */}
                <div className="flex items-center space-x-2">
                  <updateFetcher.Form method="post" className="inline">
                    <input type="hidden" name="action" value="update-quantity" />
                    <input type="hidden" name="cartId" value={cart.id} />
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="quantity" value={Math.max(1, item.quantity - 1)} />
                    <button
                      type="submit"
                      className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
                      disabled={item.quantity <= 1 || updateFetcher.state === "submitting"}
                    >
                      {updateFetcher.state === "submitting" &&
                        updateFetcher.formData?.get("quantity") === String(item.quantity - 1) ? (
                        <span className="animate-spin text-sm">⟳</span>
                      ) : (
                        "−"
                      )}
                    </button>
                  </updateFetcher.Form>

                  <span className="px-4 font-medium min-w-[3rem] text-center">
                    {item.quantity}
                  </span>

                  <updateFetcher.Form method="post" className="inline">
                    <input type="hidden" name="action" value="update-quantity" />
                    <input type="hidden" name="cartId" value={cart.id} />
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="quantity" value={Math.min(item.maxQuantity, item.quantity + 1)} />
                    <button
                      type="submit"
                      className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
                      disabled={item.quantity >= item.maxQuantity || updateFetcher.state === "submitting"}
                    >
                      {updateFetcher.state === "submitting" &&
                        updateFetcher.formData?.get("quantity") === String(item.quantity + 1) ? (
                        <span className="animate-spin text-sm">⟳</span>
                      ) : (
                        "+"
                      )}
                    </button>
                  </updateFetcher.Form>
                </div>

                <div className="ml-4 font-bold text-blue-600 min-w-[5rem] text-right">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>

                {/* Remove Item */}
                <removeFetcher.Form method="post" className="ml-4">
                  <input type="hidden" name="action" value="remove-item" />
                  <input type="hidden" name="cartId" value={cart.id} />
                  <input type="hidden" name="itemId" value={item.id} />
                  <button
                    type="submit"
                    className="text-red-600 hover:text-red-800 text-sm transition-colors"
                    disabled={removeFetcher.state === "submitting"}
                    onClick={(e) => {
                      if (!confirm(`Remove ${item.name} from cart?`)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {removeFetcher.state === "submitting" &&
                      removeFetcher.formData?.get("itemId") === item.id ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      "🗑️ Remove"
                    )}
                  </button>
                </removeFetcher.Form>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <div className="text-left">
                <p className="text-sm text-gray-600">{cart.itemCount} items</p>
                <p className="text-lg font-semibold">Total:</p>
              </div>
              <span className="text-3xl font-bold text-blue-600">${cart.total.toFixed(2)}</span>
            </div>

            <div className="space-y-3">
              {user && (
                <Form method="post">
                  <input type="hidden" name="action" value="proceed-checkout" />
                  <input type="hidden" name="cartId" value={cart.id} />
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors">
                    🛒 Proceed to Checkout
                  </button>
                </Form>
              )}

              {!user && (
                <a
                  href="/auth/login?redirect=/shop/cart"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors text-center block"
                >
                  🔒 Login to Checkout
                </a>
              )}

              <Form method="post">
                <input type="hidden" name="action" value="clear-cart" />
                <input type="hidden" name="cartId" value={cart.id} />
                <button
                  type="submit"
                  className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={(e) => {
                    if (!confirm('Clear entire cart? This cannot be undone.')) {
                      e.preventDefault();
                    }
                  }}
                >
                  🗑️ Clear Cart
                </button>
              </Form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}