import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-foreground px-6 text-background mt-auto py-6">
      <div className="container mx-auto flex flex-col items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-xl">🥬</span>
          </div>
          <span className="text-lg font-bold">Shopper</span>
        </Link>
        <div className="flex items-center gap-4 text-xs text-background/60">
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
