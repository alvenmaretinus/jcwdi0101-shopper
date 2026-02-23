export interface CartItem {
  id: number | string;
  // backend sometimes returns productId instead of id
  productId?: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  discountedPrice?: number;
  productPromotionDiscount?: number;
  image?: string;
  quantity: number;
  unit?: string;
  stock: number;
  isBuyOneGetOne?: boolean;
  bogoFreeQuantity?: number;
  outOfStock?: boolean;
}

export interface CartResponse {
  success?: boolean;
  // backend returns either an array or an object { cartId, cartItems }
  data:
    | CartItem[]
    | {
        cartId: string | null;
        cartItems: CartItem[];
        pricing?: {
          subtotal: number;
          totalDiscount: number;
          productPromotionDiscount?: number;
          globalDiscount?: number;
          shippingCost: number;
          grandTotal: number;
        };
      };
  total?: number;
  subtotal?: number;
  message?: string;
}
export interface RawBackendCartItem {
  id?: number | string;
  productId?: number | string;
  name?: string;
  price?: number | string;
  image?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[];
  quantity?: number | string;
  unit?: string;
  stockQuantity?: number | string;
  productTotal?: number | string;
  originalPrice?: number | string;
  discountedPrice?: number | string;
  productPromotionDiscount?: number | string;
  bogoFreeQuantity?: number;
  outOfStock?: boolean;
}
