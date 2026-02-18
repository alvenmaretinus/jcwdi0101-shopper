"use client";

import { AlertCircle } from "lucide-react";

export const ShippingInfo = () => {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
      <div className="text-sm text-blue-800 dark:text-blue-200">
        <p className="font-semibold mb-1">Informasi Pengiriman</p>
        <p>
          Sistem akan otomatis memilih toko terdekat (dalam radius 5 km) dari
          alamat pengiriman Anda untuk memproses pesanan ini.
        </p>
      </div>
    </div>
  );
};

export default ShippingInfo;
