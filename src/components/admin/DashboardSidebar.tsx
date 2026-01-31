"use client";

import { cn } from "@/lib/utils";
import { Copy, FileText, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardSidebar() {
    const pathname = usePathname();

    const items = [
        { label: "Orders", href: "/admin/dashboard", icon: Copy },
        { label: "Invoices", href: "/admin/invoices", icon: FileText },
        { label: "Customer", href: "/admin/customers", icon: Users },
    ];

    return (
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full font-sans">
            {/* Logo Placeholder */}
            {/* Note: User asked for Logo in Topbar, but usually sidebar has it too? 
                 Prompt: "Top Navigation Bar: Left Side: Place a 'Your Logo' placeholder." 
                 So Sidebar might just be menu items? 
                 "Left Sidebar Navigation: Include a vertical menu..." 
                 "Structure: A standard three-part layout: Left Sidebar, Top Navigation Bar..." 
                 I'll keep sidebar focused on navigation. */}

            <div className="p-6">
                <nav className="space-y-1">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg",
                                (pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href)))
                                    ? "bg-slate-800 text-white border-l-4 border-sky-500"
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white border-l-4 border-transparent"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
