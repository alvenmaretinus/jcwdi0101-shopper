import Link from "next/link";

export const BottomFooter = () => {
  return (
    <div className="border-t border-background/10">
      <div className="container mx-auto py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/60">
        <p>© 2026 Shopper. All rights reserved.</p>
        <div className="flex gap-6">
          <Link
            href="/privacy"
            className="hover:text-primary transition-colors"
          >
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
};
