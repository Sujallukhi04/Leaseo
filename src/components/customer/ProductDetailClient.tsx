"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addToCart } from "@/actions/customer/cart";
import { Heart, Minus, Plus, ShoppingCart, ArrowRightLeft, Calendar } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProductDetailClientProps {
    product: any; // Using any for simplicity given the Prisma types issue
}

export const ProductDetailClient = ({ product }: ProductDetailClientProps) => {
    const [quantity, setQuantity] = useState(1);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleAddToCart = () => {
        if (!startDate || !endDate) {
            toast.error("Please select a rental period");
            return;
        }

        startTransition(async () => {
            const res = await addToCart(product.id, quantity, new Date(startDate), new Date(endDate));
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Added to cart!");
                router.refresh();
            }
        });
    };

    const primaryPricing = product.rentalPricing && product.rentalPricing[0];
    const displayPrice = primaryPricing ? primaryPricing.price : product.basePrice;
    const displayPeriod = primaryPricing ? primaryPricing.periodType.toLowerCase() : "day";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Right Column: Details (as per reference, user wants details on right, image on left) */}
            {/* But first let's handle the layout in the page.tsx, this component can just be the inputs area or the whole right side. */}
            {/* Let's make this the interactive part. */}

            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                        {product.name}
                    </h1>
                    <div className="text-2xl font-bold text-primary">
                        Rs {Number(displayPrice).toLocaleString()}
                        <span className="text-base font-normal text-muted-foreground ml-2">
                            / {displayPeriod}
                        </span>
                    </div>
                </div>

                <div className="p-6 bg-card border rounded-xl space-y-6 shadow-sm">
                    <div className="space-y-4">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Rental Period
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="start-date" className="text-xs text-muted-foreground">Start Date</Label>
                                <Input
                                    id="start-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="end-date" className="text-xs text-muted-foreground">End Date</Label>
                                <Input
                                    id="end-date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate || new Date().toISOString().split('T')[0]}
                                    className="bg-background/50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-end gap-4">
                        <div className="space-y-2">
                            <Label>Quantity</Label>
                            <div className="flex items-center h-10 border rounded-md bg-background/50">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-full rounded-none"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-full rounded-none"
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <Button
                            className="flex-1 h-10 gap-2"
                            onClick={handleAddToCart}
                            disabled={isPending}
                        >
                            <ShoppingCart className="w-4 h-4" />
                            {isPending ? "Adding..." : "Add to cart"}
                        </Button>

                        <Button variant="outline" size="icon" className="h-10 w-10">
                            <Heart className="w-4 h-4" />
                        </Button>

                        <Button variant="outline" size="icon" className="h-10 w-10">
                            <ArrowRightLeft className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-lg">Product Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        {product.description || "No description available."}
                    </p>
                </div>
            </div>
        </div>
    );
};
