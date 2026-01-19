import { TopFooter } from "./TopFooter";
import { BottomFooter } from "./BottomFooter";

export function Footer() {
  return (
    <footer className="bg-foreground px-6 text-background mt-auto">
      <TopFooter />
      <BottomFooter />
    </footer>
  );
}
