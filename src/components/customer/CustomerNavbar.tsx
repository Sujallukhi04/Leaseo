"use client";

import Link from "next/link";
import { Search, Heart, ShoppingCart, User, LogOut, Settings, Package, UserCircle, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getCart } from "@/actions/customer/cart";

export const CustomerNavbar = () => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const router = useRouter();
    const [cartCount, setCartCount] = useState(0);

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/auth/login");
    };

    useEffect(() => {
        const fetchCartCount = async () => {
            const { cart } = await getCart();
            if (cart && cart.items) {
                setCartCount(cart.items.length);
            }
        };
        fetchCartCount();
    }, []);

    return (
        <nav className="w-full border-b bg-background py-4 px-6 sticky top-0 z-50">
            <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
                {/* Logo and Links */}
                <div className="flex items-center gap-8">
                    <Link href="/customer/dashboard" className="text-xl font-bold">
                        Leaseo
                    </Link>
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/customer/dashboard/products" className="hover:text-primary transition-colors">Products</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms & Condition</Link>
                        <Link href="/about" className="hover:text-primary transition-colors">About us</Link>
                        <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-md hidden md:block relative">
                    <Input
                        type="search"
                        placeholder="Search products..."
                        className="w-full pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>

                {/* Right Icons */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="relative">
                        <Heart className="h-5 w-5" />
                    </Button>

                    <Link href="/customer/cart">
                        <Button variant="ghost" size="icon" className="relative">
                            <ShoppingCart className="h-5 w-5" />
                            <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        </Button>
                    </Link>

                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="relative">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full bg-muted"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            <User className="h-5 w-5" />
                        </Button>

                        {isProfileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-card border rounded-md shadow-lg py-1 z-50">
                                <Link href="/customer/profile" className="flex items-center px-4 py-2 text-sm hover:bg-muted">
                                    <UserCircle className="mr-2 h-4 w-4" /> My Profile
                                </Link>
                                <Link href="/customer/dashboard/orders" className="flex items-center px-4 py-2 text-sm hover:bg-muted">
                                    <Package className="mr-2 h-4 w-4" /> My Orders
                                </Link>
                                <Link href="/customer/dashboard/settings" className="flex items-center px-4 py-2 text-sm hover:bg-muted">
                                    <Settings className="mr-2 h-4 w-4" /> Settings
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-4 py-2 text-sm hover:bg-muted text-red-500"
                                >
                                    <LogOut className="mr-2 h-4 w-4" /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div >
            </div >
        </nav >
    );
};
