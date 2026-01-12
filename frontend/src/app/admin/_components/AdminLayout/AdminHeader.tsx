import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

type Props = {
  setIsOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AdminHeader = ({ setIsOpenSidebar }: Props) => {
  const isMobile = useIsMobile();

  return (
    <header className="h-14 flex items-center gap-4 border-b border-border px-4 sticky top-0 z-10">
      {isMobile && (
        <>
          <SidebarTrigger
            onClick={(prev) => setIsOpenSidebar(!prev)}
            className="shrink-0"
          />
          <Separator orientation="vertical" className="h-6" />
        </>
      )}
      <h1 className="text-lg w-full text-center font-medium capitalize text-foreground">
        SHOPPER
      </h1>
    </header>
  );
};
