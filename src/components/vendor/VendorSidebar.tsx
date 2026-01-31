"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    FileText,
    Settings,
    LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

export function VendorSidebar() {
    const pathname = usePathname();

    const routes = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/vendor/dashboard",
            active: pathname === "/vendor/dashboard",
        },
        {
            label: "Orders",
            icon: ShoppingCart,
            href: "/vendor/dashboard/orders",
            active: pathname.includes("/vendor/dashboard/orders"),
        },
        {
            label: "Products",
            icon: Package,
            href: "/vendor/products",
            active: pathname.includes("/vendor/products"),
        },
        {
            label: "Reports",
            icon: FileText,
            href: "/vendor/reports",
            active: pathname === "/vendor/reports",
        },
        {
            label: "Settings",
            icon: Settings,
            href: "/vendor/settings",
            active: pathname === "/vendor/settings",
        },
    ];

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-100 text-slate-800 border-r border-slate-200">
            <div className="px-3 py-2 flex-1">
                <Link href="/vendor/dashboard" className="flex items-center pl-3 mb-14">
                    <h1 className="text-2xl font-bold">
                        Vendor<span className="text-blue-600">Portal</span>
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-blue-600 hover:bg-blue-100/50 rounded-lg transition",
                                route.active
                                    ? "text-blue-600 bg-blue-100"
                                    : "text-slate-500"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.active ? "text-blue-600" : "text-slate-500 group-hover:text-blue-600")} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <button
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="flex items-center p-3 w-full justify-start font-medium cursor-pointer text-slate-500 hover:text-red-600 hover:bg-red-100/50 rounded-lg transition"
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
}
