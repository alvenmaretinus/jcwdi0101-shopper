export type UserAddress = {
  id: string;
  addressType: AddressType;
  addressName: string;
  recipientName: string;
  isDefault: boolean;
  longitude: number;
  latitude: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

type AddressType = "HOME" | "OFFICE";
