export interface CartItem {
  id: number | string;
  // backend sometimes returns productId instead of id
  productId?: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  quantity: number;
  unit?: string;
  stock: number;
  isBuyOneGetOne?: boolean;
  outOfStock?: boolean;
}

export interface CartResponse {
  success?: boolean;
  // backend returns either an array or an object { cartId, cartItems }
  data: CartItem[] | { cartId: string | null; cartItems: CartItem[] };
  total?: number;
  subtotal?: number;
  message?: string;
}
export interface RawBackendCartItem{
  id?: number | string;
  productId?: number | string;
  name?: string;
  price?: number | string;
  image?: string;
  quantity?: number | string;
  unit?: string;
  stockQuantity?: number | string;
  productTotal?: number | string;
  outOfStock?: boolean;
};
