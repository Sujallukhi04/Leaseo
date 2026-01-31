"use client";

import Link from "next/link";
import { Search, Filter, LayoutGrid, List as ListIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Order {
    id: string;
    orderNumber: string;
    customer: string;
    status: string;
    total: string;
    date: string;
    // Mock fields for now if API doesn't return them yet
    productName?: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";
    const { replace, push } = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        async function fetchOrders() {
            setLoading(true);
            try {
                const res = await fetch(`/api/vendor/orders?query=${query}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, [query]);

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("query", term);
        } else {
            params.delete("query");
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "CONFIRMED": return "bg-green-100 text-green-700 border-green-200";
            case "DRAFT": return "bg-gray-100 text-gray-700 border-gray-200";
            case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
            case "INVOICED": return "bg-blue-100 text-blue-700 border-blue-200";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight">Rental Orders</h1>
                    <Button onClick={() => push("/vendor/orders/new")} className="bg-purple-500 hover:bg-purple-600">
                        <Plus className="mr-2 h-4 w-4" /> New
                    </Button>
                </div>

                <div className="flex items-center border rounded-md bg-background">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewMode("kanban")}
                        className={cn("rounded-none border-r", viewMode === "kanban" && "bg-muted")}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewMode("list")}
                        className={cn("rounded-none", viewMode === "list" && "bg-muted")}
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-card p-2 rounded-lg border">
                <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search orders..."
                        className="pl-8 border-none shadow-none focus-visible:ring-0"
                        onChange={(e) => handleSearch(e.target.value)}
                        defaultValue={searchParams.get("query")?.toString()}
                    />
                </div>
                <div className="flex items-center gap-2 border-l pl-4">
                    <Button variant="ghost">Pickup</Button>
                    <Button variant="ghost">Return</Button>
                </div>
            </div>

            {/* Content View */}
            {viewMode === "list" ? (
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Order Reference</TableHead>
                                <TableHead>Order Date</TableHead>
                                <TableHead>Customer Name</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Rental Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">Loading orders...</TableCell>
                                </TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">No orders found.</TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order.id} className="group cursor-pointer hover:bg-muted/50" onClick={() => push(`/vendor/orders/${order.id}`)}>
                                        <TableCell>
                                            <input type="checkbox" className="rounded border-gray-300" />
                                        </TableCell>
                                        <TableCell className="font-medium text-purple-600">
                                            {order.orderNumber}
                                        </TableCell>
                                        <TableCell>{format(new Date(order.date), "MMM d, yyyy")}</TableCell>
                                        <TableCell className="font-medium">{order.customer}</TableCell>
                                        <TableCell>${order.total}</TableCell>
                                        <TableCell>
                                            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(order.status))}>
                                                {order.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {loading ? (
                        <div>Loading...</div>
                    ) : orders.length === 0 ? (
                        <div>No orders found.</div>
                    ) : (
                        orders.map((order) => (
                            <Card key={order.id} className="cursor-pointer hover:border-purple-500 transition-colors" onClick={() => push(`/vendor/orders/${order.id}`)}>
                                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                                    <span className="font-bold text-sm">{order.customer}</span>
                                    <span className="text-xs text-muted-foreground">{order.orderNumber}</span>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-2xl font-bold">${order.total}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Rental Duration: 3 Days
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0 flex justify-between">
                                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium border", getStatusColor(order.status))}>
                                        {order.status}
                                    </span>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
