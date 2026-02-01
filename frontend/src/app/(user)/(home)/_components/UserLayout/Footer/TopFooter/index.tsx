import {
  Facebook,
  Mail,
  MapPin,
  Phone,
  Instagram,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import { BrandInformationFooter } from "./BrandInformation";
import { LinksFooter } from "./LinksFooter";

const footerLinks = {
  shop: [
    { label: "All Products", path: "/products" },
    { label: "Categories", path: "/categories" },
    { label: "Deals & Offers", path: "/deals" },
    { label: "New Arrivals", path: "/products?sort=newest" },
  ],
  support: [
    { label: "Help Center", path: "/help" },
    { label: "Shipping Info", path: "/shipping" },
    { label: "Returns", path: "/returns" },
    { label: "Track Order", path: "/orders" },
  ],
  company: [
    { label: "About Us", path: "/about" },
    { label: "Careers", path: "/careers" },
    { label: "Store Locations", path: "/stores" },
    { label: "Contact", path: "/contact" },
  ],
};

export const TopFooter = () => {
  return (
    <div className="container mx-auto py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Brand column */}
        <BrandInformationFooter />
        <LinksFooter links={footerLinks.shop} />
        <LinksFooter links={footerLinks.support} />
        <LinksFooter links={footerLinks.company} />
      </div>
    </div>
  );
};
