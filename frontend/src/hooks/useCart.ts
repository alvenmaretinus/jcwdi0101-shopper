import { useState, useEffect } from "react";
import { apiFetch, HttpMethod } from "@/lib/apiFetch";
import { toast } from "sonner";
import { formatPrice } from "@/lib/formatPrice";
import { CartItem, CartResponse, RawBackendCartItem } from "@/types/cart";

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
        method: HttpMethod.GET,
      });
      console.log("[useCart] Cart response:", response);
      // Backend returns { cartId, cartItems } — normalize to frontend CartItem shape
      const data = response?.data;
      let items: CartItem[] = [];
      if (Array.isArray(data)) {
        items = data as CartItem[];
      } else if (
        data &&
        Array.isArray((data as { cartItems?: unknown }).cartItems)
      ) {
        const raw = (data as { cartItems: RawBackendCartItem[] }).cartItems;
        // Normalize backend fields: productId -> id, stockQuantity -> stock
        items = raw.map((it) => ({
          id: it.productId ?? it.id ?? 0,
          productId: it.productId ?? it.id,
          name: it.name ?? "",
          price:
            typeof it.price === "number" ? it.price : Number(it.price) || 0,
          image: it.image,
          quantity:
            typeof it.quantity === "number"
              ? it.quantity
              : Number(it.quantity) || 0,
          unit: it.unit,
          stock:
            typeof it.stockQuantity === "number"
              ? it.stockQuantity
              : Number(it.productTotal) || 0,
          outOfStock: it.outOfStock ?? false,
        }));
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

      const maxStock =
        typeof item.stock === "number" ? item.stock : Number(item.stock) || 0;
      const newQuantity = Math.max(
        1,
        Math.min(maxStock, item.quantity + delta)
      );

      // Update optimistically
      setCartItems((items) =>
        items.map((it) =>
          it.id === id ? { ...it, quantity: newQuantity } : it
        )
      );

      // Sync with backend - send productId (backend expects productId)
      await apiFetch("/cart", {
        method: "PATCH",
        body: { productId: item.productId ?? id, quantity: newQuantity },
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
      // Find item and call backend to delete by productId
      const item = cartItems.find((it) => it.id === id);
      if (!item) return;

      await apiFetch("/cart", {
        method: "DELETE",
        body: { productId: item.productId ?? id },
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
    ? cartItems.reduce(
        (sum, item) => sum + (item.price * item.quantity || 0),
        0
      )
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
