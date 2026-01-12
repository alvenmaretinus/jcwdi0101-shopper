import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePathname } from "next/navigation";

type Props = {
  setIsOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AdminHeader = ({ setIsOpenSidebar }: Props) => {
  const isMobile = useIsMobile();

  const pathName = usePathname();
  const pathSegments = pathName
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment !== "");

  const currentSegment =
    pathSegments.length === 1 ? "Dashboard" : pathSegments[1];

  return (
    <header className="h-14 flex items-center gap-4 border-b border-border px-4 bg-background sticky top-0 z-10">
      {isMobile && (
        <>
          <SidebarTrigger
            onClick={(prev) => setIsOpenSidebar(!prev)}
            className="shrink-0"
          />
          <Separator orientation="vertical" className="h-6" />
        </>
      )}
      <h2 className="text-lg font-semibold">{currentSegment}</h2>
    </header>
  );
};
