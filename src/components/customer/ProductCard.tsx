"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Image from "next/image";

import Link from "next/link";


interface ProductProps {
    id: string; // Added id
    image: string;
    title: string;
    price: string;
    period: string;
    status: "In Stock" | "Out of Stock";
    vendorName?: string;
    category?: string;
}

export const ProductCard = ({ id, image, title, price, period, status, vendorName, category }: ProductProps) => {
    return (
        <Link href={`/customer/product/${id}`}>
            <Card className="overflow-hidden group hover:shadow-lg transition-shadow h-full cursor-pointer flex flex-col">
                <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
                    {image ? (
                        <div className="w-full h-full relative">
                            <Image src={image} alt={title} fill className="object-cover" />
                        </div>
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-muted-foreground">
                            <span className="text-xs">No Image</span>
                        </div>
                    )}

                    {category && (
                        <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded uppercase tracking-wider font-semibold z-10">
                            {category}
                        </span>
                    )}

                    {status === "Out of Stock" && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                            <span className="text-white font-bold border-2 border-white px-4 py-2 rounded">
                                Out of Stock
                            </span>
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={(e) => {
                            e.preventDefault(); // Prevent navigating when clicking heart
                            // TODO: Implement wishlist toggle
                        }}
                    >
                        <Heart className="h-5 w-5 text-gray-600" />
                    </Button>
                </div>

                <CardContent className="p-4 text-center flex-1 flex flex-col justify-between">
                    <div>
                        {vendorName && (
                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                                {vendorName}
                            </p>
                        )}
                        <h3 className="font-semibold text-lg truncate" title={title}>{title}</h3>
                    </div>
                    <p className="text-primary font-medium mt-1">
                        {price} <span className="text-sm text-muted-foreground font-normal">/ {period}</span>
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
};
