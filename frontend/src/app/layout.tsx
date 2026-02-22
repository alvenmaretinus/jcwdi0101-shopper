import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shopper | Online Grocery & Fresh Delivery from Your Nearest Store",
  description: "Online grocery and fresh delivery from your nearest store.",
  keywords: [
    "Shopper App",
    "Shopper Online Grocery",
    "Shopper Local Delivery",
    "Hyper-local grocery shopping",
    "Smart shopping assistant",
  ],
  icons: {
    icon: "/shopper-favico.png",
    shortcut: "/shopper-favico.png",
    apple: "/shopper-favico.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
