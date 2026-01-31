import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default async function VendorInvoicesPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return <div className="p-8">Please log in.</div>;
    }

    const invoices = await db.invoice.findMany({
        where: {
            // Assuming invoices are linked to orders which contain vendor products
            // This query might need refinement depending on how multi-vendor orders work in your system
            // For now, we fetch invoices where the order has items from this vendor
            order: {
                items: {
                    some: {
                        product: {
                            vendorId: session.user.id
                        }
                    }
                }
            }
        },
        include: {
            order: true,
            customer: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
            </div>

            {invoices.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg">No invoices found</h3>
                        <p className="text-muted-foreground">
                            Invoices generated for your orders will appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Order #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                    <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>{invoice.order.orderNumber}</TableCell>
                                    <TableCell>{invoice.customer.firstName || "Guest"}</TableCell>
                                    <TableCell>₹{Number(invoice.totalAmount).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={invoice.status === 'PAID' ? 'default' : 'secondary'}>
                                            {invoice.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
