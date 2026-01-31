"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings } from "lucide-react";

export function VendorHeader() {
    const pathname = usePathname();

    const navItems = [
        { label: "Dashboard", href: "/vendor/dashboard" },
        { label: "Orders", href: "/vendor/orders" },
        { label: "Products", href: "/vendor/products" },
        { label: "Reports", href: "/vendor/reports" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <div className="mr-4 hidden md:flex">
                    <Link className="mr-6 flex items-center space-x-2" href="/vendor/dashboard">
                        <span className="hidden font-bold sm:inline-block">
                            Your Logo
                        </span>
                    </Link>
                    <nav className="flex items-center gap-4 text-sm lg:gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "transition-colors hover:text-foreground/80",
                                    pathname?.startsWith(item.href)
                                        ? "text-foreground"
                                        : "text-foreground/60"
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Link
                            href="/vendor/settings"
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                pathname?.startsWith("/vendor/settings")
                                    ? "text-foreground"
                                    : "text-foreground/60"
                            )}
                        >
                            Settings
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search can go here */}
                    </div>
                    <nav className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/vendor/settings">
                                <Settings className="h-4 w-4" />
                                <span className="sr-only">Settings</span>
                            </Link>
                        </Button>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder-user.jpg" alt="@user" />
                            <AvatarFallback>VN</AvatarFallback>
                        </Avatar>
                    </nav>
                </div>
            </div>
        </header>
    );
}
