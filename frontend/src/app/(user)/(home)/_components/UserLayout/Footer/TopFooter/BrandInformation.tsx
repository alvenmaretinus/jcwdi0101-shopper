import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import Link from "next/link";

export const BrandInformationFooter = () => {
  return    <div className="lg:col-span-2">
  <Link href="/" className="flex items-center gap-2 mb-4">
    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
      <span className="text-2xl">🥬</span>
    </div>
    <span className="text-xl font-bold">Shopper</span>
  </Link>
  <p className="text-background/70 mb-6 max-w-sm">
    Your trusted online grocery store. Fresh products delivered right
    to your doorstep, from the nearest store.
  </p>


  <div className="space-y-3 text-sm text-background/70">
    <div className="flex items-center gap-3">
      <Phone className="h-4 w-4 text-primary" />
      <span>+62 21 1234 5678</span>
    </div>
    <div className="flex items-center gap-3">
      <Mail className="h-4 w-4 text-primary" />
      <span>hello@shopper.id</span>
    </div>
    <div className="flex items-center gap-3">
      <MapPin className="h-4 w-4 text-primary" />
      <span>Jakarta Selatan, Indonesia</span>
    </div>
  </div>

  <div className="flex gap-4 mt-6">
    <a
      href="#"
      className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
    >
      <Facebook className="h-5 w-5" />
    </a>
    <a
      href="#"
      className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
    >
      <Instagram className="h-5 w-5" />
    </a>
    <a
      href="#"
      className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
    >
      <Twitter className="h-5 w-5" />
    </a>
  </div>
</div>
};

