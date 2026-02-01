"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    Menu,
    Bell,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useCurrentUserClient } from "@/hook/use-current-user";
import { signOut } from "next-auth/react";
import { Dancing_Script } from "next/font/google";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const dancingScript = Dancing_Script({ subsets: ["latin"] });

const navLinks = [
    { title: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
    { title: "Orders", href: "/vendor/orders", icon: ShoppingCart },
    { title: "Products", href: "/vendor/products", icon: Package },
    { title: "Customers", href: "/vendor/customers", icon: Users },
    { title: "Invoices", href: "/vendor/invoices", icon: FileText },
    { title: "Reports", href: "/vendor/reports", icon: BarChart3 },
    { title: "Settings", href: "/vendor/settings", icon: Settings },
];

export function VendorNavbar() {
    const { user } = useCurrentUserClient();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const initials = user
        ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "V"
        : "V";

    if (!mounted) {
        return (
            <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between font-sans transition-colors duration-300">
                <div className="flex items-center gap-8">
                    <span className={`font-bold text-3xl text-sky-500 ${dancingScript.className}`}>Leaseo</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 lg:px-12 flex items-center justify-between font-sans sticky top-0 z-50 transition-colors duration-300">
            {/* Left: Logo & Desktop Nav */}
            <div className="flex items-center gap-8">
                {/* Mobile Menu Trigger */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        <div className="flex items-center h-16 px-6 border-b border-slate-200 dark:border-slate-800">
                            <span className={`font-bold text-2xl text-sky-500 ${dancingScript.className}`}>Leaseo</span>
                        </div>
                        <nav className="flex-1 overflow-y-auto py-4">
                            <ul className="space-y-1 px-2">
                                {navLinks.map((link) => {
                                    const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
                                    const Icon = link.icon;
                                    return (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                onClick={() => setMobileOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                                    isActive
                                                        ? "bg-sky-500 text-white"
                                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                                )}
                                            >
                                                <Icon className="h-5 w-5" />
                                                <span>{link.title}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => signOut({ callbackUrl: "/" })}
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Logout</span>
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>

                <span className={`hidden lg:block font-bold text-3xl text-sky-500 tracking-wide ${dancingScript.className}`}>
                    Leaseo
                </span>

                <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                    {navLinks.slice(0, 5).map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "hover:text-sky-500 dark:hover:text-sky-400 transition-colors",
                                (pathname === link.href || pathname?.startsWith(link.href + "/")) && "text-sky-500 dark:text-sky-400"
                            )}
                        >
                            {link.title}
                        </Link>
                    ))}
                    <Link
                        href="/vendor/reports"
                        className={cn(
                            "hover:text-sky-500 dark:hover:text-sky-400 transition-colors",
                            pathname?.startsWith("/vendor/reports") && "text-sky-500 dark:text-sky-400"
                        )}
                    >
                        Reports
                    </Link>
                </nav>
            </div>

            {/* Right: Actions & User */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-4 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white">
                            <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                                <AvatarImage src={user?.image || undefined} />
                                <AvatarFallback className="bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-500">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-left hidden sm:block">
                                <span className="text-sm font-semibold leading-none">
                                    {user?.firstName || "Vendor"}
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 ml-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                        <DropdownMenuItem className="focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white cursor-pointer" asChild>
                            <Link href="/vendor/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white cursor-pointer" asChild>
                            <Link href="/vendor/settings">Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                        <DropdownMenuItem className="flex items-center px-2 py-1.5 focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white" onSelect={(e) => e.preventDefault()}>
                            <div className="flex items-center justify-between w-full">
                                <span>Theme</span>
                                <Switch
                                    checked={theme === 'dark'}
                                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                    className="data-[state=checked]:bg-sky-500"
                                />
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                        <DropdownMenuItem
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-500 cursor-pointer"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
