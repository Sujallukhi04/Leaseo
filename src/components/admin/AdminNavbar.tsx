"use client";

import { Search, Bell, ChevronDown, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dancing_Script } from "next/font/google";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const dancingScript = Dancing_Script({ subsets: ["latin"] });

interface AdminNavbarProps {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        firstName?: string | null;
        lastName?: string | null;
    }
}

export function AdminNavbar({ user }: AdminNavbarProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between font-sans">
                {/* Replicating structure purely for visual consistency during hydration */}
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <span className={`font-bold text-3xl text-sky-500 dark:text-sky-400 ${dancingScript.className}`}>Leaseo</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-12 flex items-center justify-between font-sans">
            {/* Left: Logo & Links */}
            <div className="flex items-center gap-8">
                <span className={`font-semibold text-3xl text-sky-500 tracking-wide ${dancingScript.className}`}>
                    Leaseo
                </span>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <Link href="/admin/dashboard" className="text-slate-900 dark:text-white hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Orders</Link>
                    <Link href="/admin/products" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Products</Link>
                    <Link href="/admin/reports" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Reports</Link>
                    <Link href="/admin/settings" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Settings</Link>
                </nav>
            </div>

            {/* Right: Profile */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-slate-500">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-4 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.image || "/placeholder-user.jpg"} />
                                <AvatarFallback className="bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-200">
                                    {user?.firstName ? `${user.firstName[0]}${user.lastName?.[0] || ''}` : "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-left hidden sm:block">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
                                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : (user?.name || user?.email || "User")}
                                </span>
                                <span className="text-[10px] text-slate-500">Admin</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-500 ml-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem className="flex items-center px-2 py-1.5 focus:bg-accent focus:text-accent-foreground" onSelect={(e) => e.preventDefault()}>
                            <Switch
                                checked={theme === 'dark'}
                                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                            />
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
