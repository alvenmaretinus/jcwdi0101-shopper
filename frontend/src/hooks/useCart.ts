import { useState, useEffect, useCallback } from "react";
import { apiFetch, HttpMethod } from "@/lib/apiFetch";
import { toast } from "sonner";
import { formatPrice } from "@/lib/formatPrice";
import { CartItem, CartResponse, RawBackendCartItem } from "@/types/cart";
import { authClient } from "@/lib/authClient";

type UseCartOptions = {
  autoFetch?: boolean;
};

const CART_UPDATED_EVENT = "cart-updated";

const emitCartUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
};

export function useCart({ autoFetch = true }: UseCartOptions = {}) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [serverPricingDiscount, setServerPricingDiscount] = useState(0);
  const [loading, setLoading] = useState(autoFetch);
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const isLoggedIn = !!session?.user;

  const fetchCart = useCallback(
    async (silent = false) => {
      if (!isLoggedIn) {
        setCartItems([]);
        setServerPricingDiscount(0);
        setLoading(false);
        return;
      }

      try {
        if (!silent) setLoading(true);
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
          const typedData = data as {
            cartItems: RawBackendCartItem[];
            pricing?: { totalDiscount?: number };
          };
          const raw = typedData.cartItems;
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
                : Number(it.stockQuantity) || 0,
            bogoFreeQuantity: it.bogoFreeQuantity ?? 0,
            outOfStock: it.outOfStock ?? false,
          }));

          setServerPricingDiscount(typedData.pricing?.totalDiscount ?? 0);
        } else {
          items = [];
          setServerPricingDiscount(0);
        }
        console.log("[useCart] Setting cart items:", items);
        setCartItems(items);
      } catch (error) {
        console.error("[useCart] Failed to fetch cart:", error);
        // on error, clear cart and show toast
        setCartItems([]);
        setServerPricingDiscount(0);
        toast.error("Failed to load cart");
      } finally {
        setLoading(false);
      }
    },
    [isLoggedIn]
  );

  useEffect(() => {
    if (!autoFetch) {
      setLoading(false);
      return;
    }

    if (isSessionPending) {
      setLoading(true);
      return;
    }

    void fetchCart();
  }, [autoFetch, fetchCart, isSessionPending]);

  useEffect(() => {
    if (!autoFetch) return;
    if (typeof window === "undefined") return;

    const handleCartUpdated = () => {
      void fetchCart(true); // Silent fetch to avoid loading flicker
    };

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    };
  }, [autoFetch, fetchCart]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!isLoggedIn) {
      toast.info("Please login to add items to cart");
      return;
    }

    try {
      await apiFetch("/cart", {
        method: HttpMethod.POST,
        body: { productId, quantity },
      });
      toast.success("Added to cart successfully");
      // Refetch cart to get updated items (silent to avoid loading flicker)
      await fetchCart(true);
      emitCartUpdated();
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  const updateQuantity = async (id: number | string, delta: number) => {
    if (!isLoggedIn) return;

    try {
      const item = Array.isArray(cartItems)
        ? cartItems.find((item) => item.id === id)
        : null;
      if (!item) return;

      const newQuantity = item.quantity + delta;

      // If quantity will be 0 or negative, remove item
      if (newQuantity <= 0) {
        // Update optimistically
        setCartItems((items) => items.filter((it) => it.id !== id));
        await apiFetch("/cart", {
          method: HttpMethod.DELETE,
          body: { productId: item.productId ?? id },
        });
        toast.success("Item removed from cart");
      } else {
        // Check stock limit
        const maxStock =
          typeof item.stock === "number"
            ? item.stock
            : Number(item.stock) || 999999;
        const finalQuantity =
          maxStock > 0 ? Math.min(newQuantity, maxStock) : newQuantity;

        // Update optimistically
        setCartItems((items) =>
          items.map((it) =>
            it.id === id ? { ...it, quantity: finalQuantity } : it
          )
        );

        // Sync with backend - send productId (backend expects productId)
        await apiFetch("/cart", {
          method: HttpMethod.PATCH,
          body: { productId: item.productId ?? id, quantity: finalQuantity },
        });
      }

      // Don't call fetchCart() here to avoid loading flicker
      emitCartUpdated();
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update item");
      // Refetch cart on error to sync with server state
      await fetchCart();
    }
  };

  const removeItem = async (id: number | string) => {
    if (!isLoggedIn) return;

    try {
      // Find item and call backend to delete by productId
      const item = cartItems.find((it) => it.id === id);
      if (!item) return;

      // Update optimistically
      setCartItems((items) => items.filter((it) => it.id !== id));

      await apiFetch("/cart", {
        method: HttpMethod.DELETE,
        body: { productId: item.productId ?? id },
      });

      // Don't call fetchCart() here to avoid loading flicker
      emitCartUpdated();
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item");
      // Refetch cart on error to sync with server state
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
    serverPricingDiscount,
    deliveryFee,
    refetch: fetchCart,
    formatPrice,
  };
}
