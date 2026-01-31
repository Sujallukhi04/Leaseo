"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Search,
    ShoppingCart,
    ShieldCheck,
    Truck,
    Clock,
    ArrowRight,
    Star
} from "lucide-react";

interface Product {
    id: string;
    name: string;
    basePrice: string;
    images: { url: string }[];
    category: { name: string } | null;
}

export default function LandingPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch("/api/products");
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.slice(0, 8)); // Limit to first 8 items for landing page
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden bg-slate-950 text-white">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="container relative z-10 px-4 md:px-6">
                    <div className="flex flex-col items-center text-center space-y-8">
                        <Badge variant="outline" className="px-4 py-1 text-sm border-white/20 text-white/80 bg-white/5 backdrop-blur">
                            🎉 Now Live: The Ultimate Rental Marketplace
                        </Badge>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Rent Anything, <br />
                            <span className="text-blue-400">Own the Experience.</span>
                        </h1>
                        <p className="max-w-[700px] text-lg md:text-xl text-slate-400">
                            Access a world of premium products without the commitment. From tech to tools, fashion to furniture—Leaseo makes renting simple, secure, and smart.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    className="pl-10 h-12 bg-white/10 border-white/10 text-white placeholder:text-white/50 focus-visible:ring-blue-500"
                                    placeholder="What are you looking for?"
                                />
                            </div>
                            <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25">
                                Search
                            </Button>
                        </div>

                        <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-green-400" />
                                <span>Verified Vendors</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-blue-400" />
                                <span>Fast Delivery</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-purple-400" />
                                <span>Flexible Duration</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-slate-50">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Secure Transactions</h3>
                            <p className="text-muted-foreground">Every rental is protected. We hold security deposits safely and ensure fair dispute resolution.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                                <CardTitle className="h-6 w-6 flex items-center justify-center font-bold text-lg">$</CardTitle>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Best Prices Guarnteed</h3>
                            <p className="text-muted-foreground">Competitive daily, weekly, and monthly rates. Save up to 90% compared to buying.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                                <Star className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
                            <p className="text-muted-foreground">All items are inspected and verified for quality condition before listing.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Marketplace Preview Section */}
            <section className="py-20">
                <div className="container px-4 md:px-6">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Trending Rentals</h2>
                            <p className="text-muted-foreground mt-2">Discover the most popular items rented this week.</p>
                        </div>
                        <Link href="/products">
                            <Button variant="outline" className="hidden sm:flex">
                                View All Products <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-[300px] w-full bg-muted animate-pulse rounded-xl"></div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed">
                            <div className="text-muted-foreground">No products available yet. Check back soon!</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <Card key={product.id} className="group overflow-hidden border-slate-200 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300">
                                    <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                                        {product.images && product.images.length > 0 ? (
                                            <Image
                                                src={product.images[0].url}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground bg-slate-100">
                                                No Image
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md">
                                                <Star className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold line-clamp-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{product.category?.name || "Uncategorized"}</p>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-2">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-bold text-slate-900">${product.basePrice}</span>
                                            <span className="text-sm text-muted-foreground">/day</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0">
                                        <Button className="w-full bg-slate-900 hover:bg-blue-600 transition-colors">
                                            Rent Now
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}

                    <div className="mt-10 text-center sm:hidden">
                        <Link href="/products">
                            <Button variant="outline" className="w-full">
                                View All Products
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                </div>
                <div className="container relative z-10 px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start earning?</h2>
                    <p className="text-slate-300 max-w-2xl mx-auto mb-8 text-lg">
                        Turn your idle items into extra income. Join thousands of vendors on Leaseo today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/register">
                            <Button size="lg" className="h-14 px-8 text-lg bg-white text-slate-900 hover:bg-slate-100">
                                Become a Vendor
                            </Button>
                        </Link>
                        <Link href="/products">
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/20 text-white hover:bg-white/10">
                                Browse Marketplace
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
