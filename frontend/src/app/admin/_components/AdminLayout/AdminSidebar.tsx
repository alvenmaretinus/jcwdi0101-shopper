import {
  LayoutDashboard,
  Store,
  Users,
  Package,
  FolderTree,
  Boxes,
  ShoppingCart,
  Percent,
  BarChart3,
  PackageSearch,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/authClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserByEmail } from "@/services/user/getUserByEmail";

const mainMenuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
];

const superAdminItems = [
  { title: "Stores", url: "/admin/stores", icon: Store },
  { title: "Users", url: "/admin/users", icon: Users },
];

const catalogItems = [
  { title: "Categories", url: "/admin/categories", icon: FolderTree },
  { title: "Products", url: "/admin/products", icon: Package },
];

const operationsItems = [
  { title: "Inventory", url: "/admin/inventory", icon: Boxes },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Discounts", url: "/admin/discounts", icon: Percent },
];

const reportItems = [
  { title: "Sales Report", url: "/admin/sales", icon: BarChart3 },
  { title: "Stock Report", url: "/admin/stock", icon: PackageSearch },
];

export function AdminSidebar() {
  const { data } = authClient.useSession();
  const user = data?.user;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const initialFetch = async () => {
      if (user) {
        const { role } = await getUserByEmail(user.email);
        if (role === "SUPERADMIN") {
          setIsSuperAdmin(true);
        }
      }
    };

    initialFetch();
  }, [user]);

  const router = useRouter();
  const logout = async () => {
    await authClient.signOut();
    router.push("/login");
  };
  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            G
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground">
              Grocery Admin
            </span>
            <Badge
              variant={isSuperAdmin ? "default" : "secondary"}
              className="text-xs w-fit mt-0.5"
            >
              {isSuperAdmin ? "Super Admin" : "Store Admin"}
            </Badge>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <AdminSidebarMenuItem items={mainMenuItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <AdminSidebarMenuItem items={superAdminItems} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Catalog</SidebarGroupLabel>
          <SidebarGroupContent>
            <AdminSidebarMenuItem items={catalogItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <AdminSidebarMenuItem items={operationsItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <AdminSidebarMenuItem items={reportItems} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.email || "mail@shopper.com"}
            </p>
          </div>
          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="shrink-0 cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="p-2.5">Logout</TooltipContent>
          </Tooltip>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

const AdminSidebarMenuItem = ({ items }: { items: typeof mainMenuItems }) => (
  <SidebarMenu>
    {items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <Link
            href={item.url}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))}
  </SidebarMenu>
);
