import { useState, useEffect } from "react";
import { apiFetch, HttpMethod } from "@/lib/apiFetch";
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
      const response = await apiFetch<CartResponse>("/cart", {
        method: HttpMethod.GET,
      });
      // Handle different response structures
      const items = Array.isArray(response) 
        ? response 
        : Array.isArray(response?.data) 
          ? response.data 
          : [];
      setCartItems(items);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCartItems([]); // Ensure it's always an array on error
      // Don't show error toast on initial load if user is not logged in
      if (error instanceof Error && !error.message.includes("Unauthorized")) {
        toast.error("Failed to load cart");
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      await apiFetch("/cart", {
        method: HttpMethod.POST,
        body: { productId, quantity },
      });
      toast.success("Added to cart successfully");
      // Refetch cart to get updated items
      await fetchCart();
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  const updateQuantity = async (id: number | string, delta: number) => {
    try {
      const item = Array.isArray(cartItems) 
        ? cartItems.find((item) => item.id === id)
        : null;
      if (!item) return;

      const newQuantity = Math.max(
        1,
        Math.min(item.stock, item.quantity + delta)
      );

      // Update optimistically
      setCartItems((items) =>
        Array.isArray(items)
          ? items.map((item) =>
              item.id === id ? { ...item, quantity: newQuantity } : item
            )
          : []
      );

      // Sync with backend
      await apiFetch("/cart", {
        method: HttpMethod.PATCH,
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
      // Update optimistically
      setCartItems((items) => 
        Array.isArray(items) ? items.filter((item) => item.id !== id) : []
      );

      // Sync with backend
      await apiFetch("/cart", {
        method: HttpMethod.DELETE,
        body: { productId: id },
      });
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
        method: HttpMethod.POST,
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
    ? cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  const deliveryFee = subtotal >= 200000 ? 0 : 15000;

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    applyPromo,
    subtotal,
    deliveryFee,
    refetch: fetchCart,
    formatPrice,
  };
}
