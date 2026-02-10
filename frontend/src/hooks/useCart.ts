import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { toast } from "sonner";
import { formatPrice } from "@/lib/formatPrice";
import { CartItem, CartResponse } from "@/types/cart";

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart items on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      console.log("[useCart] Fetching cart...");
      const response = await apiFetch<CartResponse>("/cart", {
        method: "GET",
      });
      console.log("[useCart] Cart response:", response);
      // Backend returns { cartId, cartItems } — accept that shape or plain array
      const data = response?.data;
      let items: any[] = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data && Array.isArray(data.cartItems)) {
        items = data.cartItems;
      } else {
        items = [];
      }
      console.log("[useCart] Setting cart items:", items);
      setCartItems(items);
    } catch (error) {
      console.error("[useCart] Failed to fetch cart:", error);
      // on error, clear cart and show toast
      setCartItems([]);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id: number | string, delta: number) => {
    try {
      const item = cartItems.find((item) => item.id === id);
      if (!item) return;

      const newQuantity = Math.max(
        1,
        Math.min(item.stock, item.quantity + delta)
      );

      // Update optimistically
      setCartItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );

      // Sync with backend
      await apiFetch("/cart", {
        method: "PATCH",
        body: { productId: id, quantity: newQuantity },
      });
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update item");
      // Refetch cart on error
      await fetchCart();
    }
  };

  const removeItem = async (id: number | string) => {
    try {
      // Call backend to delete
      await apiFetch("/cart", {
        method: "DELETE",
        body: { productId: id },
      });
      // Refresh cart
      await fetchCart();
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item");
      // Refetch cart on error
      await fetchCart();
    }
  };

  const applyPromo = async (code: string) => {
    try {
      await apiFetch("/promo/validate", {
        method: "POST",
        body: { code },
      });
      toast.success("Promo code applied successfully");
      return { success: true, message: "" };
    } catch (error) {
      console.error("Failed to apply promo:", error);
      const errorMessage = "Invalid promo code";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const subtotal = Array.isArray(cartItems)
    ? cartItems.reduce(
        (sum, item) => sum + (item.price * item.quantity || 0),
        0
      )
    : 0;

  const deliveryFee = subtotal >= 200000 ? 0 : 15000;

  return {
    cartItems,
    loading,
    updateQuantity,
    removeItem,
    applyPromo,
    subtotal,
    deliveryFee,
    refetch: fetchCart,
    formatPrice,
  };
}
