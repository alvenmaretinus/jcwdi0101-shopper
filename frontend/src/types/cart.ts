export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  quantity: number;
  unit?: string;
  stock: number;
  isBuyOneGetOne?: boolean;
}

export interface CartResponse {
  data: CartItem[];
  total?: number;
  subtotal?: number;
}
