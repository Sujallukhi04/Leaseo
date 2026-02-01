"use client";

import { useState } from "react";
import {
    Search,
    LayoutGrid,
    List,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    Users,
    RefreshCw,
    MoreHorizontal,
    Eye,
    MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VendorCustomer } from "@/actions/vendor";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VendorCustomerListProps {
    initialCustomers: VendorCustomer[];
}

export function VendorCustomerList({ initialCustomers }: VendorCustomerListProps) {
    const [customers, setCustomers] = useState<VendorCustomer[]>(initialCustomers);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [search, setSearch] = useState("");

    // Pagination (Client Side for "Versatile" feel on small/medium datasets)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = viewMode === "grid" ? 12 : 10;

    const filteredCustomers = customers.filter(c =>
        (c.firstName?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (c.lastName?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (c.email?.toLowerCase() || "").includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getInitials = (firstName: string | null, lastName: string | null) => {
        return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
            {/* Header */}
            <div className="flex flex-col gap-4 p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 transition-colors duration-300">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customers</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            View and manage your customer details
                        </p>
                    </div>
                    {/* View Toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-md p-1 border border-slate-200 dark:border-slate-700 ml-auto md:ml-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={viewMode === "grid" ? "bg-white dark:bg-slate-700 shadow-sm" : ""}
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={viewMode === "list" ? "bg-white dark:bg-slate-700 shadow-sm" : ""}
                            onClick={() => setViewMode("list")}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search customers..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="pl-10 bg-slate-100 dark:bg-slate-800 border-none focus-visible:ring-sky-500"
                        />
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 hidden md:block">
                        {filteredCustomers.length} customers
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                {filteredCustomers.length === 0 ? (
                    <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                            <Users className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No customers found</h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            Try adjusting your search terms or wait for new orders.
                        </p>
                    </div>
                ) : viewMode === "grid" ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {paginatedCustomers.map(customer => (
                            <div key={customer.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                <div className="p-6 flex flex-col items-center text-center">
                                    <Avatar className="h-20 w-20 mb-4 ring-2 ring-slate-100 dark:ring-slate-800">
                                        <AvatarImage src={customer.image || undefined} />
                                        <AvatarFallback className="text-lg bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                                            {getInitials(customer.firstName, customer.lastName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                                        {customer.firstName || ""} {customer.lastName || ""}
                                    </h3>

                                    <div className="space-y-1 mt-2 mb-6 w-full">
                                        {customer.email ? (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 truncate w-full">
                                                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                                <span className="truncate">{customer.email}</span>
                                            </p>
                                        ) : <p className="text-sm text-slate-400">-</p>}
                                        {customer.phone && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                                                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                                {customer.phone}
                                            </p>
                                        )}
                                    </div>

                                    <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">{customer.totalOrders}</p>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Orders</p>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-sky-600 dark:text-sky-400">₹{customer.totalSpent.toLocaleString()}</p>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Spent</p>
                                        </div>
                                    </div>
                                </div>
                                {customer.lastOrderDate && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 text-xs text-center text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                                        Last active {formatDistanceToNow(new Date(customer.lastOrderDate), { addSuffix: true })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Contact Info</TableHead>
                                    <TableHead className="text-center">Total Orders</TableHead>
                                    <TableHead className="text-right">Total Spent</TableHead>
                                    <TableHead>Last Active</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedCustomers.map(customer => (
                                    <TableRow key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={customer.image || undefined} />
                                                    <AvatarFallback className="bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                                                        {getInitials(customer.firstName, customer.lastName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="font-medium text-slate-900 dark:text-white">
                                                    {customer.firstName} {customer.lastName}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span className="text-slate-600 dark:text-slate-300">{customer.email || "-"}</span>
                                                <span className="text-slate-400 text-xs">{customer.phone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-semibold text-slate-700 dark:text-slate-300">
                                            {customer.totalOrders}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-sky-600 dark:text-sky-400">
                                            ₹{customer.totalSpent.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500">
                                            {customer.lastOrderDate ? format(new Date(customer.lastOrderDate), "MMM d, yyyy") : "-"}
                                        </TableCell>
                                        <TableCell>
                                            {/* Action placeholder */}
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="bg-white dark:bg-slate-800"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                        </Button>
                        <span className="text-sm text-slate-500 mx-2">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="bg-white dark:bg-slate-800"
                        >
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
