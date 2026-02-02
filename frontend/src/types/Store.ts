import { StoreProduct } from "./StoreProduct";

export type Store = {
  id: string;
  name: string;
  description: string;
  phone: string;
  longitude: number;
  latitude: number;
  postCode: string;
  addressName: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StoreWithProducts = Store & {
    products: StoreProduct[];
}