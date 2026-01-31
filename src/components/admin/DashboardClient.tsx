"use client";

import { useState, useMemo } from "react";
import { Plus, Settings, Search, Upload, Download, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RentalOrderKanban } from "@/components/admin/RentalOrderKanban";
import { RentalOrderList } from "@/components/admin/RentalOrderList";
import { RentalStatusSidebar } from "@/components/admin/RentalStatusSidebar";
import { OrderDetailsSheet } from "@/components/admin/OrderDetailsSheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as XLSX from 'xlsx';

interface DashboardClientProps {
    orders: any[];
}

export function DashboardClient({ orders }: DashboardClientProps) {
    const [view, setView] = useState<"kanban" | "list">("kanban");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [activeTab, setActiveTab] = useState<"ALL" | "PICKUP" | "RETURN">("ALL");
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    // Calculate counts
    const counts = useMemo(() => {
        const c = {
            TOTAL: orders.length,
            DRAFT: 0,
            CONFIRMED: 0,
            IN_PROGRESS: 0,
            COMPLETED: 0,
            CANCELLED: 0
        };
        orders.forEach(o => {
            if (c[o.status as keyof typeof c] !== undefined) {
                c[o.status as keyof typeof c]++;
            }
        });
        return c;
    }, [orders]);

    const filteredOrders = orders.filter((order) => {
        const searchLower = searchQuery.toLowerCase();

        // Status Filter (Sidebar)
        const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

        // Search Filter
        const matchesSearch =
            order.orderNumber.toLowerCase().includes(searchLower) ||
            order.customer.firstName?.toLowerCase().includes(searchLower) ||
            order.customer.lastName?.toLowerCase().includes(searchLower) ||
            order.items.some((item: any) => item.product.name.toLowerCase().includes(searchLower));

        // Tab Filter (Pickup / Return)
        let matchesTab = true;
        if (activeTab === "PICKUP") {
            matchesTab = order.status === "COMPLETED"; // Adjust if needed
        } else if (activeTab === "RETURN") {
            matchesTab = order.status === "IN_PROGRESS";
        }

        return matchesStatus && matchesSearch && matchesTab;
    });

    // Helper for safe date formatting including time for clearer uniqueness if needed, 
    // but typically "Jan 01, 2024" is clean.
    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        // Format: "Jan 14, 2025"
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleExport = (type: 'csv' | 'excel') => {
        // Flatten data for export
        const dataToExport = filteredOrders.map(order => ({
            "Order No": order.orderNumber,
            "Date": formatDate(order.createdAt),
            "Customer Name": `${order.customer.firstName} ${order.customer.lastName}`,
            "Items": order.items.map((i: any) => `${i.quantity}x ${i.product.name}`).join(", "),
            "Total Amount": order.totalAmount,
            "Status": order.status,
            "Start Date": formatDate(order.startDate),
            "End Date": formatDate(order.endDate)
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        // Increased column widths to prevent "######" in Excel
        const wscols = [
            { wch: 15 }, // Order No
            { wch: 15 }, // Date
            { wch: 25 }, // Customer Name
            { wch: 40 }, // Items
            { wch: 15 }, // Amount
            { wch: 15 }, // Status
            { wch: 15 }, // Start
            { wch: 15 }  // End
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

        // Generate file
        if (type === 'csv') {
            XLSX.writeFile(workbook, "rental_orders.csv");
        } else {
            XLSX.writeFile(workbook, "rental_orders.xlsx");
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans">
            {/* Top Control Bar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Rental Order</h1>

                    <div className="flex items-center border rounded-md overflow-hidden bg-slate-50 dark:bg-slate-800">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-9 px-3 rounded-none border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                    <Download className="w-4 h-4 mr-2" /> Export Records
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => handleExport('csv')}>Export as CSV</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport('excel')}>Export as Excel</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="ghost" size="sm" className="h-9 px-3 rounded-none text-slate-600 dark:text-slate-300">
                            <Upload className="w-4 h-4 mr-2" /> Import Records
                        </Button>
                    </div>

                    <div className="relative w-64 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-100 dark:bg-slate-800 border-none h-10 w-full focus-visible:ring-sky-500"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            variant={activeTab === "PICKUP" ? "default" : "outline"}
                            onClick={() => setActiveTab(activeTab === "PICKUP" ? "ALL" : "PICKUP")}
                            className={activeTab === "PICKUP" ? "bg-sky-500 hover:bg-sky-600 text-white border-transparent" : ""}
                        >
                            Pickup
                        </Button>
                        <Button
                            variant={activeTab === "RETURN" ? "default" : "outline"}
                            onClick={() => setActiveTab(activeTab === "RETURN" ? "ALL" : "RETURN")}
                            className={activeTab === "RETURN" ? "bg-sky-500 hover:bg-sky-600 text-white border-transparent" : ""}
                        >
                            Return
                        </Button>
                        <Button className="bg-sky-500 hover:bg-sky-600 text-white gap-2 rounded-lg">
                            <Plus className="w-4 h-4" /> New
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 rounded-md ${view === "kanban" ? "bg-white dark:bg-slate-700 shadow-sm" : "hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                            onClick={() => setView("kanban")}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 rounded-md ${view === "list" ? "bg-white dark:bg-slate-700 shadow-sm" : "hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                            onClick={() => setView("list")}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Status Sidebar */}
                <RentalStatusSidebar
                    counts={counts}
                    currentFilter={statusFilter}
                    onFilterChange={setStatusFilter}
                />

                {/* View Area */}
                <div className="flex-1 overflow-auto p-4 bg-slate-50 dark:bg-black">
                    {view === "kanban" ? (
                        <RentalOrderKanban orders={filteredOrders} onSelectOrder={setSelectedOrder} />
                    ) : (
                        <RentalOrderList orders={filteredOrders} onSelectOrder={setSelectedOrder} />
                    )}
                </div>
            </div>

            <OrderDetailsSheet
                order={selectedOrder}
                open={!!selectedOrder}
                onOpenChange={(open) => !open && setSelectedOrder(null)}
            />
        </div>
    );
}
