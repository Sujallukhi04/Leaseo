"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
  Menu,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useCurrentUserClient } from "@/hook/use-current-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/vendor/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    href: "/vendor/orders",
    icon: ShoppingCart,
  },
  {
    title: "Products",
    href: "/vendor/products",
    icon: Package,
  },
  {
    title: "Invoices",
    href: "/vendor/invoices",
    icon: FileText,
  },
  {
    title: "Customers",
    href: "/vendor/customers",
    icon: Users,
  },
  {
    title: "Reports",
    href: "/vendor/reports",
    icon: BarChart3,
  },
  {
    title: "Profile",
    href: "/vendor/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/vendor/settings",
    icon: Settings,
  },
];

function SidebarContent({
  collapsed,
  onCollapse,
}: {
  collapsed: boolean;
  onCollapse?: () => void;
}) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link
            href="/vendor/dashboard"
            className={cn(
              "flex items-center gap-2 font-bold text-xl",
              collapsed && "justify-center",
            )}
          >
            <Store className="h-6 w-6 text-primary" />
            {!collapsed && <span>Vendor Portal</span>}
          </Link>
          {onCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCollapse}
              className="hidden lg:flex"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {sidebarLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname?.startsWith(link.href + "/");
              const Icon = link.icon;

              const linkContent = (
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <Icon className={cn("h-5 w-5", collapsed && "h-5 w-5")} />
                  {!collapsed && <span>{link.title}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <li key={link.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{link.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                );
              }

              return <li key={link.href}>{linkContent}</li>;
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}

export function VendorSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-background border-r transition-all duration-300",
        collapsed ? "w-[70px]" : "w-64",
      )}
    >
      <SidebarContent
        collapsed={collapsed}
        onCollapse={() => setCollapsed(!collapsed)}
      />
    </aside>
  );
}

export function VendorHeader() {
  const { user } = useCurrentUserClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() ||
    "V"
    : "V";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      {/* Mobile menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>

      {/* Search (optional) */}
      <div className="flex-1" />

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline-block text-sm font-medium">
              {user?.firstName || "Vendor"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/vendor/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
