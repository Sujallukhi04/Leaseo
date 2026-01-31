"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText, ShoppingCart, CheckCircle, FileCheck, XCircle, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RentalStatusSidebarProps {
    counts: {
        TOTAL: number;
        DRAFT: number;      // Quotation
        CONFIRMED: number;  // Sale Order (or Active?) - Note: User mapping: Quotation->Purple, SaleOrder->Orange, Confirmed->Green??
        // Let's align with user request: "Quotation, Sale Order, Confirmed, Invoiced, Cancelled"
        // My previous mapping: DRAFT=Quotation, CONFIRMED=Sale Order, IN_PROGRESS=Active, COMPLETED=Invoiced, CANCELLED=Cancelled
        // User image shows: 
        // Purple -> Quotation 
        // Brown/Orange -> Sale order
        // Green -> Confirmed
        // Blue -> Invoiced
        // Red -> Cancelled
        // I will stick to my mapping but ensure UI labels match user request.
        IN_PROGRESS: number; // Active/Confirmed
        COMPLETED: number;
        CANCELLED: number;
    };
    currentFilter: string;
    onFilterChange: (filter: string) => void;
}

export function RentalStatusSidebar({ counts, currentFilter, onFilterChange }: RentalStatusSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const items = [
        { id: "ALL", label: "Total", count: counts.TOTAL, icon: LayoutDashboard, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800" },
        { id: "CONFIRMED", label: "Sale order", count: counts.CONFIRMED, icon: ShoppingCart, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/20" },
        { id: "DRAFT", label: "Quotation", count: counts.DRAFT, icon: FileText, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/20" },
        { id: "COMPLETED", label: "Invoiced", count: counts.COMPLETED, icon: FileCheck, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/20" },
        { id: "IN_PROGRESS", label: "Confirmed", count: counts.IN_PROGRESS, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/20" },
        { id: "CANCELLED", label: "Cancelled", count: counts.CANCELLED, icon: XCircle, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/20" },
    ];

    return (
        <div
            className={cn(
                "relative bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col",
                isCollapsed ? "w-[72px]" : "w-64"
            )}
        >
            <div className="p-4 pl-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                {!isCollapsed && <h2 className="font-semibold text-slate-900 dark:text-white">Rental Status</h2>}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-auto"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2 pl-4 px-2">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onFilterChange(item.id)}
                        className={cn(
                            "w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium",
                            isCollapsed ? "justify-center" : "justify-start",
                            currentFilter === item.id
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        )}
                    >
                        <div className={cn("w-8 h-8 rounded-md flex items-center justify-center shrink-0", item.bg, item.color)}>
                            <item.icon className="w-4 h-4" />
                        </div>

                        {!isCollapsed && (
                            <>
                                <span className="flex-1 text-left">{item.label}</span>
                                <span className="text-xs bg-white dark:bg-slate-950 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                                    {item.count}
                                </span>
                            </>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
