"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Printer, Mail } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function OrderDetailsPage({ params }: { params: { orderId: string } }) {
    const [status, setStatus] = useState("Quotation");

    return (
        <div className="space-y-6">
            {/* Top Action Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="default" className="bg-purple-600 hover:bg-purple-700">Save</Button>
                    <Button variant="outline">Discard</Button>
                </div>
            </div>

            {/* Main Card Wrapper */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                {/* Status Header */}
                <div className="flex flex-col md:flex-row items-center justify-between border-b p-4 gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            className="bg-purple-500 hover:bg-purple-600 text-white"
                            onClick={() => setStatus("Sale Order")}
                        >
                            Confirm
                        </Button>
                        <Button variant="outline">Create Invoice</Button>
                        <Button variant="outline">Send by Email</Button>
                    </div>

                    {/* Status Stepper */}
                    <div className="flex items-center rounded-md border bg-muted/50 p-1">
                        {["Quotation", "Quotation Sent", "Sale Order"].map((step, idx, arr) => (
                            <div
                                key={step}
                                className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-colors cursor-default
                            ${status === step ? "bg-background shadow-sm border text-foreground" : "text-muted-foreground"}
                            ${idx < arr.length - 1 ? "border-r-0" : ""}
                        `}
                            >
                                {step}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Order Title */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">S00075</h1>
                        <div className="text-sm text-muted-foreground space-x-4">
                            <span>Date: Jan 31, 2026</span>
                        </div>
                    </div>

                    {/* Customer & Dates */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                <Label className="text-muted-foreground">Customer</Label>
                                <div className="font-medium">Dutiful cobra</div>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                <Label className="text-muted-foreground">Invoice Address</Label>
                                <div className="text-sm">123 Street, City, Country</div>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                <Label className="text-muted-foreground">Delivery Address</Label>
                                <div className="text-sm">123 Street, City, Country</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                <Label className="text-muted-foreground">Rental Period</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono">2026-02-01</span>
                                    <span className="text-muted-foreground">→</span>
                                    <span className="text-sm font-mono">2026-02-05</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                                <Label className="text-muted-foreground">Duration</Label>
                                <span>4 Days</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs for Order Lines */}
                    <div className="space-y-4">
                        <div className="border-b flex gap-6 text-sm font-medium">
                            <div className="border-b-2 border-primary px-1 py-2">Order Lines</div>
                            <div className="text-muted-foreground px-1 py-2">Other Info</div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Taxes</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>
                                        <div>Computers</div>
                                        <div className="text-xs text-muted-foreground">Short Term Rental</div>
                                    </TableCell>
                                    <TableCell>20 Units</TableCell>
                                    <TableCell>Rs 20,000</TableCell>
                                    <TableCell>--</TableCell>
                                    <TableCell className="text-right">Rs 400,000</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <div>Downpayment</div>
                                    </TableCell>
                                    <TableCell>20 Units</TableCell>
                                    <TableCell>--</TableCell>
                                    <TableCell>--</TableCell>
                                    <TableCell className="text-right">--</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>

                        {/* Add Line Action */}
                        <div className="flex gap-4 text-sm text-blue-500">
                            <button className="hover:underline">Add a Product</button>
                            <button className="hover:underline">Add a note</button>
                        </div>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end pt-4">
                        <div className="w-[300px] space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Untaxed Amount:</span>
                                <span>Rs 400,000</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>Rs 400,000</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground">
                            Terms & Conditions: <Link href="#" className="text-blue-500 underline">https://xxxxx.xxx.xxx/terms</Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
