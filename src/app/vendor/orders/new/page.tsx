"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { toast } from "sonner";
import { CalendarIcon, Plus, Trash, Printer, FileText, Check, Send } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// --- Types ---
interface Customer {
    id: string;
    name: string;
    email: string;
}

interface Product {
    id: string;
    name: string;
    basePrice: number;
}

interface OrderFormValues {
    customerId: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        tax: number;
        amount: number;
    }[];
}

// --- Status Badge ---
const StatusBadge = ({ status, current }: { status: string; current: string }) => {
    const isActive = status === current;
    return (
        <div
            className={cn(
                "px-4 py-2 text-sm font-medium border-r last:border-r-0 flex items-center justify-center min-w-[120px]",
                isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
            )}
        >
            {status}
        </div>
    );
};

export default function NewOrderPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState("Quotation");

    const form = useForm<OrderFormValues>({
        defaultValues: {
            items: [{ productId: "", quantity: 1, unitPrice: 0, tax: 0, amount: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    // Fetch Data
    useEffect(() => {
        async function initData() {
            try {
                const [custRes, prodRes] = await Promise.all([
                    fetch("/api/vendor/customers"),
                    fetch("/api/vendor/products"),
                ]);
                if (custRes.ok) setCustomers(await custRes.json());
                if (prodRes.ok) setProducts(await prodRes.json());
            } catch (err) {
                console.error("Failed to load initial data", err);
            }
        }
        initData();
    }, []);

    // Watch for totals
    const watchedItems = form.watch("items");
    const subtotal = watchedItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const taxTotal = watchedItems.reduce((acc, item) => acc + ((Number(item.amount) || 0) * (Number(item.tax) / 100)), 0);
    const total = subtotal + taxTotal;

    // Handle Product Selection Change
    const handleProductChange = (index: number, productId: string) => {
        const product = products.find((p) => p.id === productId);
        if (product) {
            form.setValue(`items.${index}.unitPrice`, product.basePrice);
            // Recalculate amount immediately
            const qty = form.getValues(`items.${index}.quantity`) || 1;
            form.setValue(`items.${index}.amount`, product.basePrice * qty);
        }
    };

    // Recalculate Amount on Qty/Price change
    // Note: In real app use useEffect or custom hook, here simple inline checks in render or specialized handler
    const recalculateRow = (index: number) => {
        const row = form.getValues(`items.${index}`);
        const amount = (row.quantity || 0) * (row.unitPrice || 0);
        form.setValue(`items.${index}.amount`, amount);
    };


    const onSubmit = async (data: OrderFormValues) => {
        setLoading(true);
        try {
            // Send to API
            const res = await fetch("/api/vendor/orders", {
                method: "POST",
                body: JSON.stringify({
                    ...data,
                    status: currentStatus === "Sale Order" ? "CONFIRMED" : "DRAFT", // Map UI status to DB status
                    totalAmount: total,
                    subtotal: subtotal,
                    taxAmount: taxTotal
                })
            });

            if (!res.ok) throw new Error("Failed to create order");

            toast.success(`Order created as ${currentStatus}`);
            router.push("/vendor/orders");
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-purple-500 border-purple-200 bg-purple-50">New</Badge>
                    <h1 className="text-2xl font-bold">Rental Order</h1>
                </div>

                {/* Status Bar (Mockup Logic) */}
                <div className="flex rounded-md overflow-hidden border">
                    <StatusBadge status="Quotation" current={currentStatus} />
                    <StatusBadge status="Quotation Sent" current={currentStatus} />
                    <StatusBadge status="Sale Order" current={currentStatus} />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
                <Button onClick={form.handleSubmit(onSubmit)} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                    <Send className="mr-2 h-4 w-4" /> Send
                </Button>
                <Button variant="outline" onClick={() => setCurrentStatus("Sale Order")}>
                    <Check className="mr-2 h-4 w-4" /> Confirm
                </Button>
                <Button variant="outline">
                    <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
                <Button variant="secondary" className="bg-pink-100 text-pink-700 hover:bg-pink-200" onClick={() => router.push("/vendor/invoices")}>
                    <FileText className="mr-2 h-4 w-4" /> Create Invoice
                </Button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Customer & Dates */}
                    <Card>
                        <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="customerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a customer" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {customers.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name || c.email}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Rental Start</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                        >
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Rental End</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                        >
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Lines */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Order Lines</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-12 gap-4 p-4 border-b text-sm font-medium bg-muted/50">
                                <div className="col-span-4">Product</div>
                                <div className="col-span-2">Quantity</div>
                                <div className="col-span-2">Unit Price</div>
                                <div className="col-span-1">Tax %</div>
                                <div className="col-span-2">Amount</div>
                                <div className="col-span-1"></div>
                            </div>

                            <div className="p-4 space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-4">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.productId`}
                                                render={({ field }) => (
                                                    <Select onValueChange={(val) => {
                                                        field.onChange(val);
                                                        handleProductChange(index, val);
                                                    }} defaultValue={field.value}>
                                                        <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                                                        <SelectContent>
                                                            {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Input type="number" {...form.register(`items.${index}.quantity`, {
                                                valueAsNumber: true,
                                                onChange: () => recalculateRow(index)
                                            })} />
                                        </div>
                                        <div className="col-span-2">
                                            <Input type="number" {...form.register(`items.${index}.unitPrice`, {
                                                valueAsNumber: true,
                                                onChange: () => recalculateRow(index)
                                            })} />
                                        </div>
                                        <div className="col-span-1">
                                            <Input type="number" placeholder="0" {...form.register(`items.${index}.tax`, { valueAsNumber: true })} />
                                        </div>
                                        <div className="col-span-2">
                                            <Input type="number" readOnly {...form.register(`items.${index}.amount`)} className="bg-muted" />
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500 hover:bg-red-50">
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <Button type="button" variant="ghost" onClick={() => append({ productId: "", quantity: 1, unitPrice: 0, tax: 0, amount: 0 })} className="text-primary mt-2">
                                    <Plus className="mr-2 h-4 w-4" /> Add a Product
                                </Button>
                            </div>

                            <Separator />

                            {/* Totals Section */}
                            <div className="flex justify-end p-6">
                                <div className="w-full max-w-xs space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Untaxed Amount:</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Taxes:</span>
                                        <span>${taxTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                        <span>Total:</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-xs text-muted-foreground">
                        Terms & Conditions apply. Standard rental agreement version 2.0.
                    </div>

                </form>
            </Form>
        </div>
    );
}
