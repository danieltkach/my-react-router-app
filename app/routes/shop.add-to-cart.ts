import type { ActionFunctionArgs } from "react-router";
import { getCurrentUser } from "~/lib/auth-v2.server";
import { addToCart } from "~/lib/cart-v2.server";

// 🎯 V2 Cart API Route - Server-side only
export async function action({ request }: ActionFunctionArgs) {
  const user = await getCurrentUser(request);

  if (!user) {
    return Response.json({
      error: "Please login to add items to your cart",
      requiresLogin: true
    }, { status: 401 });
  }

  const formData = await request.formData();
  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string) || 1;

  if (!productId) {
    return Response.json({ error: "Product ID is required" }, { status: 400 });
  }

  if (quantity <= 0 || quantity > 10) {
    return Response.json({ error: "Quantity must be between 1 and 10" }, { status: 400 });
  }

  try {
    const result = await addToCart(request, productId, quantity);

    if (result.success) {
      return Response.json({
        success: true,
        message: `Added ${quantity} item(s) to your cart!`,
        cartItemCount: result.cart?.itemCount || 0
      });
    } else {
      return Response.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    return Response.json({ error: "Failed to add item to cart" }, { status: 500 });
  }
}