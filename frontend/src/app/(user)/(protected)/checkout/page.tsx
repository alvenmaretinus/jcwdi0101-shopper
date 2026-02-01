import Checkout from "./_components/Checkout";
import { getUserAddresses } from "@/services/user-address/getUserAddresses";
import { headers } from "next/headers";
import { getShippingCost } from "@/services/shipping-cost/getShippingCost";
import { ShippingCost } from "@/types/ShippingCost";
import { getStores } from "@/services/store/getStores";

const MOCK_ORDER_ITEMS = [
  {
    id: "prod-1",
    name: "Wortel",
    price: 15000,
    quantity: 1,
    weight: 30,
    image: "/sayur.jpg",
  },
  {
    id: "prod-2",
    name: "Sayur bayem",
    price: 30500,
    quantity: 2,
    weight: 15,
    image: "/sayur.jpg",
  },
];

export default async function CheckoutPage() {
  const nextHeaders = await headers();
  const totalWeight = MOCK_ORDER_ITEMS.reduce(
    (total, item) => item.weight * item.quantity + total,
    0
  );
  const totalItemValue = MOCK_ORDER_ITEMS.reduce(
    (total, item) => item.price * item.quantity + total,
    0
  );

  const addresses = await getUserAddresses(nextHeaders);
  const defaultAddress = addresses.find(
    (address) => address.isDefault === true
  );
  const stores = await getStores();
  const nearestStore = stores[0];
  let shippingServices: ShippingCost | null = null;

  if (defaultAddress && nearestStore && totalWeight && totalItemValue) {
    const shippingCost = await getShippingCost({
      originPostCode: defaultAddress.postCode,
      destinationPostCode: nearestStore.postCode,
      weight: totalWeight,
      itemValue: totalItemValue,
    });

    shippingServices = shippingCost;
  }

  return (
    <Checkout
      addresses={addresses}
      shippingData={shippingServices}
      orderItems={MOCK_ORDER_ITEMS}
      subtotal={totalItemValue}
      stores={stores}
      totalWeight={totalWeight}
    />
  );
}
