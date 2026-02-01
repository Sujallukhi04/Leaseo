"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Plus,
    Trash2,
    Calendar,
    Search,
    Package,
    User,
    CreditCard,
    FileText
} from "lucide-react";
import {
    createQuotation,
    getVendorProducts,
    getVendorCustomers,
    VendorProduct,
    VendorCustomer,
    getVendorOrderById
} from "@/actions/vendor";
import { RentalPeriodType } from "@prisma/client";
import { toast } from "sonner";
import { format } from "date-fns";

type OrderItem = {
    id: string;
    productId: string;
    productName: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    rentalStartDate: string;
    rentalEndDate: string;
    periodType: RentalPeriodType;
    periodDuration: number;
};

export function VendorOrderForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");

    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    const [products, setProducts] = useState<VendorProduct[]>([]);
    const [customers, setCustomers] = useState<VendorCustomer[]>([]);

    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [items, setItems] = useState<OrderItem[]>([]);
    const [notes, setNotes] = useState("");

    // Initialization
    useEffect(() => {
        async function init() {
            try {
                const [productsRes, customersRes] = await Promise.all([
                    getVendorProducts({ limit: 100 }),
                    getVendorCustomers({ limit: 100 }),
                ]);

                if (productsRes.success && productsRes.data) {
                    setProducts(productsRes.data.products);
                }
                if (customersRes.success && customersRes.data) {
                    setCustomers(customersRes.data.customers);
                }

                // If Edit Mode (Converting Quotation or Duplicating - though typically "edit" here means viewing details for now or continuing a draft)
                // The original list logic linked to `/vendor/orders/new?edit=${order.id}` for quotations.
                if (editId) {
                    const orderRes = await getVendorOrderById(editId);
                    if (orderRes.success && orderRes.data) {
                        const order = orderRes.data;
                        setSelectedCustomerId(order.customer.id);
                        setNotes((order as any).notes || ""); // Notes might not be in basic type, checking

                        // Map items
                        const mappedItems = order.items.map((item: any) => ({
                            id: crypto.randomUUID(),
                            productId: item.product.id,
                            productName: item.product.name,
                            productImage: item.product.images?.[0]?.url,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.totalPrice,
                            rentalStartDate: new Date(item.rentalStartDate).toISOString().split('T')[0],
                            rentalEndDate: new Date(item.rentalEndDate).toISOString().split('T')[0],
                            periodType: "DAILY" as RentalPeriodType, // Defaulting if not strictly stored on item line in previous schema
                            periodDuration: 1 // Default
                        }));
                        setItems(mappedItems);
                    }
                }
            } catch (e) {
                toast.error("Failed to load initial data");
            } finally {
                setInitializing(false);
            }
        }
        init();
    }, [editId]);


    const addItem = () => {
        const today = new Date().toISOString().split("T")[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];

        setItems([
            ...items,
            {
                id: crypto.randomUUID(),
                productId: "",
                productName: "",
                quantity: 1,
                unitPrice: 0,
                totalPrice: 0,
                rentalStartDate: today,
                rentalEndDate: nextWeek,
                periodType: "DAILY",
                periodDuration: 7,
            },
        ]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter((item) => item.id !== id));
    };

    const updateItem = (id: string, updates: Partial<OrderItem>) => {
        setItems(
            items.map((item) => {
                if (item.id !== id) return item;

                const updatedItem = { ...item, ...updates };

                // If product changed, update price
                if (updates.productId) {
                    const product = products.find((p) => p.id === updates.productId);
                    if (product) {
                        updatedItem.productName = product.name;
                        updatedItem.productImage = product.images?.[0]?.url;
                        updatedItem.unitPrice = product.basePrice;
                        // Recalc
                        updatedItem.totalPrice = product.basePrice * updatedItem.quantity * updatedItem.periodDuration;
                    }
                }

                // Logic to calculate duration from dates
                if (updates.rentalStartDate || updates.rentalEndDate) {
                    const startStr = updates.rentalStartDate || updatedItem.rentalStartDate;
                    const endStr = updates.rentalEndDate || updatedItem.rentalEndDate;

                    if (startStr && endStr) {
                        const start = new Date(startStr);
                        const end = new Date(endStr);
                        const diffTime = Math.abs(end.getTime() - start.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

                        updatedItem.periodDuration = diffDays;
                        // Recalc price
                        updatedItem.totalPrice = updatedItem.unitPrice * updatedItem.quantity * diffDays;
                    }
                }

                // Logic if quantity changed
                if (updates.quantity !== undefined) {
                    updatedItem.totalPrice = updatedItem.unitPrice * (updates.quantity) * updatedItem.periodDuration;
                }

                return updatedItem;
            }),
        );
    };

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * 0.18;
    const totalAmount = subtotal + taxAmount;

    const handleSubmit = async () => {
        if (!selectedCustomerId) return toast.error("Please select a customer");
        if (items.length === 0) return toast.error("Please add at least one product");
        if (items.some((item) => !item.productId)) return toast.error("Please select products for all items");

        setLoading(true);
        try {
            const result = await createQuotation({
                customerId: selectedCustomerId,
                items: items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    rentalStartDate: new Date(item.rentalStartDate),
                    rentalEndDate: new Date(item.rentalEndDate),
                    periodType: item.periodType,
                    periodDuration: item.periodDuration,
                })),
                notes: notes || undefined,
            });

            if (result.success) {
                toast.success("Order created successfully");
                router.push(`/vendor/orders`);
            } else {
                toast.error(result.error || "Failed to create order");
            }
        } catch (error) {
            toast.error("Failed to create order");
        } finally {
            setLoading(false);
        }
    };

    if (initializing) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 z-10 bg-white dark:bg-slate-900 pb-4 pt-4 px-2 -mx-2 border-b border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/vendor/orders">
                            <ArrowLeft className="h-5 w-5 text-slate-500" />
                        </Link>
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {editId ? "Edit Quotation" : "New Rental Order"}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {editId ? "Update order details" : "Create a new quotation for a customer"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild className="hidden sm:flex">
                        <Link href="/vendor/orders">Cancel</Link>
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="min-w-[140px] bg-sky-500 hover:bg-sky-600 text-white">
                        <FileText className="mr-2 h-4 w-4" />
                        {loading ? "Creating..." : "Create Quotation"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Selection */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-2 text-sky-500">
                                <User className="h-5 w-5" />
                                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Customer Details</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Select Customer</Label>
                                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                                    <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-11">
                                        <SelectValue placeholder="Choose a customer..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>
                                                <div className="flex flex-col text-left">
                                                    <span className="font-medium">{c.firstName} {c.lastName}</span>
                                                    <span className="text-xs text-muted-foreground">{c.email}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {selectedCustomerId && (
                                <div className="flex items-start gap-4 p-4 rounded-lg bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-900/20">
                                    <div className="h-10 w-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        {(() => {
                                            const c = customers.find(cust => cust.id === selectedCustomerId);
                                            return c ? (
                                                <>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{c.firstName} {c.lastName}</p>
                                                    <p className="text-sm text-slate-500">{c.email}</p>
                                                    <p className="text-sm text-slate-500">{c.phone}</p>
                                                </>
                                            ) : null;
                                        })()}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Items */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2 text-sky-500">
                                <Package className="h-5 w-5" />
                                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Order Items</CardTitle>
                            </div>
                            <Button size="sm" onClick={addItem} variant="outline" className="border-dashed border-sky-300 text-sky-600 hover:bg-sky-50">
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                    <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                    <p className="text-slate-500">No items added to this order yet.</p>
                                    <Button variant="link" onClick={addItem} className="text-sky-500">Add your first item</Button>
                                </div>
                            ) : (
                                items.map((item, index) => (
                                    <div key={item.id} className="group relative p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:shadow-md hover:border-sky-200 dark:hover:border-sky-900">
                                        <Button
                                            variant="ghost" size="icon"
                                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                            {/* Product & Quantity - Span 5 */}
                                            <div className="md:col-span-5 space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase text-slate-500">Product</Label>
                                                    <Select value={item.productId} onValueChange={(val) => updateItem(item.id, { productId: val })}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Product" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {products.map(p => (
                                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {item.productId && item.productName && (
                                                        <div className="flex items-center gap-3 mt-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                                                            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded overflow-hidden flex-shrink-0">
                                                                {item.productImage && <img src={item.productImage} className="w-full h-full object-cover" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">{item.productName}</p>
                                                                <p className="text-xs text-slate-500">₹{item.unitPrice}/day</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase text-slate-500">Quantity</Label>
                                                    <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })} />
                                                </div>
                                            </div>

                                            {/* Dates - Span 4 */}
                                            <div className="md:col-span-4 space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase text-slate-500">Start Date</Label>
                                                    <Input type="date" value={item.rentalStartDate} onChange={(e) => updateItem(item.id, { rentalStartDate: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase text-slate-500">End Date</Label>
                                                    <Input type="date" value={item.rentalEndDate} onChange={(e) => updateItem(item.id, { rentalEndDate: e.target.value })} />
                                                </div>
                                            </div>

                                            {/* Totals - Span 3 */}
                                            <div className="md:col-span-3 flex flex-col justify-end items-end p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                                <p className="text-xs text-slate-500 mb-1">Duration: {item.periodDuration} Days</p>
                                                <p className="text-xs text-slate-500 mb-2">Total Price</p>
                                                <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">₹{item.totalPrice.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 pb-4">
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Additional Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <textarea
                                className="w-full min-h-[100px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-slate-900 dark:border-slate-700"
                                placeholder="Add any special instructions or terms for this order..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Summary */}
                <div className="space-y-6">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-lg sticky top-24">
                        <CardHeader className="bg-slate-900 text-white dark:bg-sky-900 rounded-t-xl py-4">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                <CardTitle className="text-lg">Order Summary</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Items Count</span>
                                <span className="font-medium">{items.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                                <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">GST (18%)</span>
                                <span className="font-medium">₹{taxAmount.toLocaleString()}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-end">
                                <span className="font-bold text-lg text-slate-900 dark:text-white">Total</span>
                                <span className="font-bold text-2xl text-sky-600 dark:text-sky-400">₹{totalAmount.toLocaleString()}</span>
                            </div>

                            <div className="pt-6">
                                <Button
                                    className="w-full h-12 text-lg bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/20"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? "Processing..." : "Create Quotation"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
