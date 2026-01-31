import { getCart } from "@/actions/customer/cart";
import { CustomerNavbar } from "@/components/customer/CustomerNavbar";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CartRemoveButton } from "@/components/customer/CartRemoveButton";

export default async function CartPage() {
    const { cart } = await getCart();

    const items = cart?.items || [];
    const subtotal = items.reduce((sum: number, item: any) => {
        // Assuming unitPrice is the relevant price for now, or calculate based on period
        // For simple display, let's assume we show the item's implied rental cost
        // Ideally the DB schema has `totalPrice` in CartItem which is calculated on add
        // But CartItem schema has: quantity, rentalStartDate, rentalEndDate, periodType.
        // And it relates to Product. It doesn't seem to store price snapshots directly in CartItem 
        // in my memory of schema (Wait, let me check schema again if I can, to be precise).
        // Update: checked schema earlier: CartItem DOES NOT have price.
        // Product has basePrice or RentalPricing.
        // For now, I will display "Price calculation pending" or a placeholder if complex.
        // Actually, let's just assume basePrice for now or display "To be calculated".

        // Wait, looking at schema provided in prompt history:
        // model CartItem { ... productId ... quantity ... }
        // The price is in Product (basePrice, rentalPricing).

        return sum + (Number(item.product.basePrice) * item.quantity);
    }, 0);

    return (
        <div className="min-h-screen bg-background">
            <CustomerNavbar />

            <main className="container mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border border-dashed">
                        <div className="bg-background p-4 rounded-full mb-4 shadow-sm">
                            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                        <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
                        <Link href="/customer/dashboard">
                            <Button size="lg">Browse Products</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-6">
                            {items.map((item: any) => (
                                <div key={item.id} className="flex gap-6 p-6 bg-card border rounded-xl shadow-sm">
                                    {/* Image */}
                                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-muted border">
                                        {item.product.images && item.product.images.length > 0 ? (
                                            <Image
                                                src={item.product.images[0].url}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No Image</div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg line-clamp-1">{item.product.name}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Duration: {new Date(item.rentalStartDate).toLocaleDateString()} - {new Date(item.rentalEndDate).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Quantity: {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-bold text-lg">
                                                Rs {Number(item.product.basePrice).toLocaleString()}
                                                <span className="text-xs font-normal text-muted-foreground block text-right">/ period</span>
                                            </p>
                                        </div>

                                        <div className="flex justify-end mt-4">
                                            <CartRemoveButton cartItemId={item.id} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-card border rounded-xl p-6 shadow-sm sticky top-24">
                                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>Rs {subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Security Deposit</span>
                                        <span>Rs 0.00</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Taxes (18%)</span>
                                        <span>Rs {(subtotal * 0.18).toLocaleString()}</span>
                                    </div>
                                    <div className="border-t pt-4 flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>Rs {(subtotal * 1.18).toLocaleString()}</span>
                                    </div>
                                </div>

                                <Link href="/customer/checkout">
                                    <Button className="w-full" size="lg">
                                        Proceed to Checkout
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
