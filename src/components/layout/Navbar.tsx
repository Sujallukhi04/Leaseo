"use client";

import Link from "next/link";
import { useCurrentUserClient } from "@/hook/use-current-user";
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
import { LayoutDashboard, LogOut, Package, User } from "lucide-react";
import { signOut } from "next-auth/react";

export function Navbar() {
    const { user, status } = useCurrentUserClient();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <span className="hidden font-bold sm:inline-block">LEASEO</span>
                </Link>
                <nav className="flex items-center space-x-6 text-sm font-medium">
                    <Link
                        href="/"
                        className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                        Marketplace
                    </Link>
                    <Link
                        href="/products"
                        className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                        Products
                    </Link>
                </nav>
                <div className="ml-auto flex items-center space-x-4">
                    {status === "loading" ? (
                        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            {/* @ts-ignore */}
                            {user.role === "VENDOR" && (
                                <Link href="/vendor/dashboard">
                                    <Button variant="outline" size="sm">
                                        Vendor Dashboard
                                    </Button>
                                </Link>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.image || ""} alt={user.name || ""} />
                                            <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    {/* @ts-ignore */}
                                    {user.role === "VENDOR" && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/vendor/dashboard">
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                <span>Dashboard</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <Link href="/orders">
                                            <Package className="mr-2 h-4 w-4" />
                                            <span>My Orders</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => signOut()}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/auth/login">
                                <Button variant="ghost" size="sm">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button size="sm">Sign up</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
