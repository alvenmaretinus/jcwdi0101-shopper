"use client";

import { Store } from "lucide-react";

interface ShippingInfoProps {
  storeName?: string;
}

export const ShippingInfo = ({ storeName }: ShippingInfoProps) => {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
      <Store className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
      <div className="text-sm text-blue-800 dark:text-blue-200">
        <p className="font-semibold mb-1">Informasi Pengiriman</p>
        {storeName ? (
          <p>
            Pesanan Anda akan dikirim dari toko <strong>{storeName}</strong>{" "}
            (toko terdekat dalam radius 5 km dari alamat pengiriman Anda).
          </p>
        ) : (
          <p>
            Setelah memilih alamat pengiriman, sistem akan otomatis mencarikan
            toko terdekat (dalam radius 5 km) dan menampilkan opsi pengiriman.
          </p>
        )}
      </div>
    </div>
  );
};

export default ShippingInfo;
