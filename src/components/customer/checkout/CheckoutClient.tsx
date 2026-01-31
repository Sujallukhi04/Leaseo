"use client";

import { useTransition, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Calendar, MapPin, CreditCard, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CartRemoveButton } from "@/components/customer/CartRemoveButton";
import { updateCartItemQuantity } from "@/actions/customer/cart";
import { createOrder } from "@/actions/customer/order";
import { checkAndGrantWelcomeReward } from "@/actions/customer/rewards";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CheckoutClientProps {
    cart: any;
    userId?: string;
}

export const CheckoutClient = ({ cart, userId }: CheckoutClientProps) => {
    const items = cart?.items || [];
    const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.product.basePrice) * item.quantity), 0);
    const [couponCode, setCouponCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);

    const taxAmount = subtotal * 0.18;
    // Calculate total with discount
    const totalBeforeDiscount = subtotal + taxAmount;
    const total = totalBeforeDiscount - (appliedDiscount?.amount || 0);

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    useEffect(() => {
        if (userId) {
            const checkReward = async () => {
                const res = await checkAndGrantWelcomeReward();
                if (res.success && res.couponCode) {
                    toast.message("🎉 Welcome Gift Granted!", {
                        description: `Use code ${res.couponCode} for 10% OFF! Check your notifications.`,
                        duration: 8000,
                    });
                }
            };
            checkReward();
        }
    }, [userId]);


    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        startTransition(async () => {
            // Dynamically import to avoid circular dep if any
            const { validateCoupon } = await import("@/actions/customer/coupon");
            const res: any = await validateCoupon(couponCode, subtotal);

            if (res.error) {
                toast.error(res.error);
                setAppliedDiscount(null);
            } else if (res.success) {
                toast.success(res.message);
                setAppliedDiscount({
                    code: res.couponCode!,
                    amount: res.discountAmount!
                });
            }
        });
    };

    const handleCheckout = () => {
        startTransition(async () => {
            const res = await createOrder(appliedDiscount?.code);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Order placed successfully!");
                router.refresh();
                router.push("/customer/dashboard/orders");
            }
        });
    };

    const handleQuantityChange = (itemId: string, currentQty: number, delta: number) => {
        const newQty = currentQty + delta;
        if (newQty < 1) return;

        startTransition(async () => {
            await updateCartItemQuantity(itemId, newQty);
            router.refresh();
        });
    };

    // Calculate Rental Period Range
    let startDateDisplay = "Select dates";
    let endDateDisplay = "Select dates";

    if (items.length > 0) {
        const startDates = items.map((i: any) => new Date(i.rentalStartDate).getTime());
        const endDates = items.map((i: any) => new Date(i.rentalEndDate).getTime());

        const minDate = new Date(Math.min(...startDates));
        const maxDate = new Date(Math.max(...endDates));

        startDateDisplay = minDate.toLocaleDateString();
        endDateDisplay = maxDate.toLocaleDateString();
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Stepper */}
                <div className="flex items-center text-sm font-medium text-muted-foreground mb-8">
                    <span className="text-primary">Add to Cart</span>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <span className="text-foreground font-bold">Address</span>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <span>Payment</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Order Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold">Order Summary</h2>

                        <div className="space-y-4">
                            {items.map((item: any) => (
                                <Card key={item.id} className="border bg-card shadow-sm">
                                    <CardContent className="p-4 flex gap-4">
                                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted border">
                                            {item.product.images && item.product.images.length > 0 ? (
                                                <Image
                                                    src={item.product.images[0].url}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No Image</div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold">{item.product.name}</h3>
                                                    <p className="text-sm font-bold mt-1">Rs {Number(item.product.basePrice).toLocaleString()}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(item.rentalStartDate).toLocaleDateString()} - {new Date(item.rentalEndDate).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                {/* Quantity Control */}
                                                <div className="flex items-center border rounded-md h-8">
                                                    <button
                                                        className="px-2 hover:bg-muted text-lg disabled:opacity-50"
                                                        onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                                                        disabled={isPending || item.quantity <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-2 text-sm font-medium border-x h-full flex items-center min-w-[2rem] justify-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        className="px-2 hover:bg-muted text-lg disabled:opacity-50"
                                                        onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                                                        disabled={isPending}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                                <CartRemoveButton cartItemId={item.id} />
                                                <button className="hover:text-primary">Save for Later</button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {items.length === 0 && (
                                <div className="text-center py-12 border rounded-lg border-dashed">
                                    No items in order.
                                </div>
                            )}
                        </div>

                        <Link href="/customer/dashboard/products" className="inline-flex items-center text-primary font-medium hover:underline">
                            <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                            Continue Shopping
                        </Link>
                    </div>

                    {/* Right Column: Calculations & Actions */}
                    <div className="space-y-6">
                        <Card className="bg-card border shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Rental Period</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Input type="text" placeholder="Start Date" className="pl-10" readOnly value={startDateDisplay} />
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="relative">
                                        <Input type="text" placeholder="End Date" className="pl-10" readOnly value={endDateDisplay} />
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Delivery Charges</span>
                                        <span>-</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Sub Total</span>
                                        <span>Rs {subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Tax (18%)</span>
                                        <span>Rs {taxAmount.toLocaleString()}</span>
                                    </div>
                                    {appliedDiscount && (
                                        <div className="flex justify-between text-green-600 font-medium">
                                            <span>Discount ({appliedDiscount.code})</span>
                                            <span>- Rs {appliedDiscount.amount.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>Rs {total.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter Coupon Code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    disabled={!!appliedDiscount || isPending}
                                />
                                {appliedDiscount ? (
                                    <Button variant="outline" onClick={() => { setAppliedDiscount(null); setCouponCode(""); }}>
                                        Remove
                                    </Button>
                                ) : (
                                    <Button onClick={handleApplyCoupon} disabled={!couponCode || isPending} variant="secondary">
                                        Apply
                                    </Button>
                                )}
                            </div>

                            <Button variant="outline" className="w-full justify-between h-12">
                                <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Pay with Saved Card</span>
                            </Button>

                            <Button
                                className="w-full h-12 text-lg font-semibold shadow-md"
                                onClick={handleCheckout}
                                disabled={isPending || items.length === 0}
                            >
                                {isPending ? "Processing..." : "Checkout"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
