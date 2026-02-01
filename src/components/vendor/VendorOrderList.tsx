"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
    Search,
    Plus,
    LayoutGrid,
    List,
    MoreHorizontal,
    Eye,
    CheckCircle,
    Truck,
    RotateCcw,
    Download,
    Upload,
    FileText,
    Filter,
    Send,
    Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { updateOrderStatus, sendQuotationToCustomer, convertQuotationToOrder, createInvoice, UnifiedOrderItem } from "@/actions/vendor";
import { PaymentStatus, OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

// If UnifiedOrderItem is not exported from actions/vendor in this context, use the local definition or ensure it is exported.
// Assuming it is exported or reusing the structure if needed. 
// For safety in this tool call, I will include the local definition to avoid import errors if the previous file didn't actually export it from the action file.
// Wait, the previous file HAD it locally defined and exported. I should keep it or import it.
// The previous read showed `export type UnifiedOrderItem = ...` in the COMPONENT file. 
// So I will keep it here to be safe and self-contained.

export type UnifiedOrderItemLocal = {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: Date;
    customer: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
        phone: string | null;
    };
    items: {
        id: string;
        productId: string;
        productName: string;
        productImage: string | null;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        rentalStartDate: Date;
        rentalEndDate: Date;
    }[];
    address: {
        addressLine1: string;
        addressLine2: string | null;
        city: string;
        state: string;
        postalCode: string;
    } | null;
    isQuotation: boolean;
    quotationStatus?: string;
    validUntil?: Date;
};


const statusColors: Record<string, string> = {
    QUOTATION: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700",
    DRAFT: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
    IN_PROGRESS: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",
    COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
    CANCELLED: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
};

const statusLabels: Record<string, string> = {
    QUOTATION: "Quotation",
    DRAFT: "Quotation",
    CONFIRMED: "Sale Order",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Invoiced",
    CANCELLED: "Cancelled",
};

interface VendorOrderListProps {
    initialOrders: UnifiedOrderItemLocal[];
}

export function VendorOrderList({ initialOrders }: VendorOrderListProps) {
    const [orders, setOrders] = useState<UnifiedOrderItemLocal[]>(initialOrders);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // Changed default to grid
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [pickupFilter, setPickupFilter] = useState(false);
    const [returnFilter, setReturnFilter] = useState(false);

    // --- Actions ---
    const handleStatusChange = async (orderId: string, status: OrderStatus) => {
        try {
            const result = await updateOrderStatus(orderId, status);
            if (result.success) {
                toast.success("Order status updated");
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: status } : o));
            } else if (result.requiresRefund) {
                toast.info("Processing refund...");
                try {
                    const refundResponse = await fetch("/api/payment/refund", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            orderId,
                            reason: "Vendor cancelled the order",
                            isVendor: true,
                        }),
                    });
                    const refundResult = await refundResponse.json();
                    if (refundResult.success) {
                        toast.success("Order cancelled and refund initiated.");
                        setOrders(orders.map(o => o.id === orderId ? { ...o, status: "CANCELLED" } : o));
                    } else {
                        toast.error(refundResult.error || "Failed to process refund");
                    }
                } catch (err) {
                    toast.error("Refund failed");
                }
            } else {
                toast.error(result.error || "Failed to update status");
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    // --- Filtering ---
    const getPickupOrders = () => orders.filter((order) => order.status === "COMPLETED" && !order.isQuotation);
    const getReturnOrders = () => {
        const now = new Date();
        const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        return orders.filter((order) => {
            if (order.isQuotation || order.status === "CANCELLED") return false;
            return order.items.some((item) => new Date(item.rentalEndDate) <= oneDayFromNow);
        });
    };

    const pickupCount = getPickupOrders().length;
    const returnCount = getReturnOrders().length;

    const filteredOrders = orders.filter(order => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
            order.orderNumber.toLowerCase().includes(searchLower) ||
            (order.customer.firstName?.toLowerCase() || "").includes(searchLower) ||
            (order.customer.lastName?.toLowerCase() || "").includes(searchLower) ||
            (order.customer.email?.toLowerCase() || "").includes(searchLower);

        if (!matchesSearch) return false;

        if (pickupFilter) return order.status === "COMPLETED" && !order.isQuotation;
        if (returnFilter) {
            const now = new Date();
            const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            if (order.isQuotation || order.status === "CANCELLED") return false;
            return order.items.some((item) => new Date(item.rentalEndDate) <= oneDayFromNow);
        }

        if (statusFilter !== "all" && order.status !== statusFilter) return false;

        return true;
    });

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
            {/* Header & Controls */}
            <div className="flex flex-col gap-4 p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 transition-colors duration-300">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Rental Orders</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Manage and track all your rental orders</p>
                    </div>
                    <Button asChild className="bg-sky-500 hover:bg-sky-600 text-white h-10">
                        <Link href="/vendor/orders/new">
                            <Plus className="mr-2 h-4 w-4" /> New Order
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search orders..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-slate-100 dark:bg-slate-800 border-none focus-visible:ring-sky-500 h-10"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-10">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="QUOTATION">Quotation</SelectItem>
                                <SelectItem value="CONFIRMED">Sale Order</SelectItem>
                                <SelectItem value="IN_PROGRESS">Confirmed</SelectItem>
                                <SelectItem value="COMPLETED">Invoiced</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant={pickupFilter ? "default" : "outline"}
                            onClick={() => { setPickupFilter(!pickupFilter); setReturnFilter(false); }}
                            className={cn("h-10 px-6 min-w-[100px]", pickupFilter ? "bg-sky-500 hover:bg-sky-600 text-white border-transparent" : "dark:bg-slate-800 dark:border-slate-700 dark:text-white")}
                        >
                            Pickup
                        </Button>

                        <Button
                            variant={returnFilter ? "default" : "outline"}
                            onClick={() => { setReturnFilter(!returnFilter); setPickupFilter(false); }}
                            className={cn("h-10 px-6 min-w-[100px]", returnFilter ? "bg-sky-500 hover:bg-sky-600 text-white border-transparent" : "dark:bg-slate-800 dark:border-slate-700 dark:text-white")}
                        >
                            Return
                        </Button>

                        {/* Toggle View */}
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-md p-1 border border-slate-200 dark:border-slate-700 ml-auto h-10 items-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn("h-8 px-2 rounded-sm", viewMode === "grid" ? "bg-white dark:bg-slate-700 shadow-sm" : "")}
                                onClick={() => setViewMode("grid")}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn("h-8 px-2 rounded-sm", viewMode === "list" ? "bg-white dark:bg-slate-700 shadow-sm" : "")}
                                onClick={() => setViewMode("list")}
                            >
                                <List className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredOrders.map(order => (
                            <Card key={order.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 group overflow-hidden">
                                <CardContent className="p-0">
                                    {/* Card Header Status Strip */}
                                    <div className={`h-2 w-full ${statusColors[order.status]?.split(' ')[0] || 'bg-gray-200'}`} />

                                    <div className="p-5 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Badge variant="outline" className={cn("mb-2", statusColors[order.status])}>
                                                    {statusLabels[order.status] || order.status}
                                                </Badge>
                                                <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                                                    {order.orderNumber}
                                                </h3>
                                                <div className="flex flex-col text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                    <span>{order.customer.firstName} {order.customer.lastName}</span>
                                                    <span className="text-xs opacity-75">{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                                                </div>

                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={order.isQuotation ? `/vendor/orders/new?edit=${order.id}` : `/vendor/orders/${order.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {/* Additional actions based on status can be re-added here */}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {order.items.slice(0, 3).map((item, i) => (
                                                    <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs overflow-hidden">
                                                        {item.productImage ? <img src={item.productImage} alt="" className="w-full h-full object-cover" /> : <Package className="h-4 w-4 text-slate-400" />}
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-500 font-medium">
                                                        +{order.items.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-slate-500">Total</p>
                                                <p className="font-bold text-slate-900 dark:text-white">₹{order.totalAmount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {filteredOrders.length === 0 && (
                            <div className="col-span-full h-40 flex flex-col items-center justify-center text-slate-400">
                                <PackagesIcon className="h-10 w-10 mb-2 opacity-20" />
                                <p>No orders found matching your filters.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* List View */
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                <TableRow>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-slate-500">No orders found</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map(order => (
                                        <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <TableCell className="font-medium text-slate-900 dark:text-white">
                                                {order.orderNumber}
                                                {order.isQuotation && <Badge variant="outline" className="ml-2 text-[10px] h-5">Qt</Badge>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{order.customer.firstName} {order.customer.lastName}</span>
                                                    <span className="text-xs text-slate-500">{order.customer.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn("capitalize", statusColors[order.status])}>
                                                    {statusLabels[order.status] || order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-500">
                                                {format(new Date(order.createdAt), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-900 dark:text-white">
                                                ₹{order.totalAmount.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" asChild className="text-slate-400 hover:text-slate-900">
                                                    <Link href={order.isQuotation ? `/vendor/orders/new?edit=${order.id}` : `/vendor/orders/${order.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}

function PackagesIcon({ className }: { className?: string }) {
    return <Package className={className} />
}
