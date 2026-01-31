"use client";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
    Calendar,
    CreditCard,
    MapPin,
    Package,
    User,
    Mail,
    Phone,
    Clock
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OrderDetailsSheetProps {
    order: any | null; // Replace 'any' with Order type if available
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OrderDetailsSheet({ order, open, onOpenChange }: OrderDetailsSheetProps) {
    if (!order) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl w-full p-0 flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
                <SheetHeader className="px-6 py-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                    <div className="flex items-center justify-between mb-2">
                        <SheetTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                            Order {order.orderNumber}
                        </SheetTitle>
                        <Badge variant="outline" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                            {order.status}
                        </Badge>
                    </div>
                    <SheetDescription className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        Created on {format(new Date(order.createdAt), "PPP")}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 px-6">
                    <div className="py-6 space-y-8">
                        {/* Customer Info */}
                        <section className="space-y-4">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <User className="w-4 h-4 text-sky-500" /> Customer Details
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-semibold text-slate-600 dark:text-slate-200">
                                        {order.customer.firstName[0]}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900 dark:text-white">
                                            {order.customer.firstName} {order.customer.lastName}
                                        </div>
                                        <div className="text-sm text-slate-500">{order.customer.companyName || "Individual Customer"}</div>
                                    </div>
                                </div>
                                <Separator className="bg-slate-200 dark:bg-slate-700" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <span className="truncate">{order.customer.email}</span>
                                    </div>
                                    {order.customer.phone && (
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            <span>{order.customer.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Order Items */}
                        <section className="space-y-4">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Package className="w-4 h-4 text-sky-500" /> Rental Items
                            </h3>
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="p-4 bg-white dark:bg-slate-900 border-b last:border-0 border-slate-100 dark:border-slate-800 flex gap-4">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                            {item.product.images?.[0]?.url && (
                                                <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-slate-900 dark:text-white truncate">{item.product.name}</h4>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                <Badge variant="secondary" className="text-xs font-normal">
                                                    Qty: {item.quantity}
                                                </Badge>
                                                <Badge variant="secondary" className="text-xs font-normal">
                                                    {item.periodDuration} Days
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium text-slate-900 dark:text-white">
                                                ₹{Number(item.totalPrice).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                ₹{Number(item.unitPrice).toLocaleString()}/unit
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Payment Summary */}
                        <section className="space-y-4">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-sky-500" /> Payment Summary
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-2 border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                                    <span className="font-medium text-slate-900 dark:text-white">₹{Number(order.subtotal).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Tax</span>
                                    <span className="font-medium text-slate-900 dark:text-white">₹{Number(order.taxAmount).toLocaleString()}</span>
                                </div>
                                {Number(order.discountAmount) > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                                        <span>Discount</span>
                                        <span>-₹{Number(order.discountAmount).toLocaleString()}</span>
                                    </div>
                                )}
                                <Separator className="my-2 bg-slate-200 dark:bg-slate-700" />
                                <div className="flex justify-between text-base font-bold">
                                    <span className="text-slate-900 dark:text-white">Total</span>
                                    <span className="text-sky-600 dark:text-sky-400">₹{Number(order.totalAmount).toLocaleString()}</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </ScrollArea>

                {/* Footer / Actions - Optional */}
                {/* <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                    <Button className="w-full">Manage Order</Button>
                </div> */}
            </SheetContent>
        </Sheet>
    );
}
