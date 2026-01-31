"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  FileText, 
  Settings,
  LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  {
    label: "Orders",
    href: "/dashboard/vendor/orders",
    icon: ShoppingBag,
  },
  {
    label: "Products",
    href: "/dashboard/vendor/products",
    icon: LayoutDashboard,
  },
  {
    label: "Customers",
    href: "/dashboard/vendor/customers",
    icon: Users,
  },
  {
    label: "Reports",
    href: "/dashboard/vendor/reports",
    icon: FileText,
  },
  {
    label: "Settings",
    href: "/dashboard/vendor/settings",
    icon: Settings,
  },
];

export const VendorNavbar = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-black text-white border-b border-zinc-800">
      <div className="flex items-center gap-8">
        <Link href="/dashboard/vendor" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-xs">L</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Your Logo</span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-zinc-800",
                pathname.startsWith(item.href) ? "bg-zinc-800 text-white" : "text-zinc-400"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </nav>
  );
};
