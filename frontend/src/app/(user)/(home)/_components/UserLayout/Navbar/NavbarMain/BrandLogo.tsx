import Link from "next/link";

export const BrandLogo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
        <span className="text-2xl">🥬</span>
      </div>
      <span className="text-xl font-bold text-foreground hidden sm:block">
        Shopper
      </span>
    </Link>
  );
};
