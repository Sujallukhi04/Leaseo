"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  MoreHorizontal,
  Send,
  CheckCircle,
  Printer,
  FileText,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  Download,
  Loader2,
} from "lucide-react";
import {
  getVendorOrderById,
  updateOrderStatus,
  createInvoice,
  VendorOrder,
} from "@/actions/vendor";
import { format } from "date-fns";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Quotation",
  CONFIRMED: "Sale Order",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<VendorOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);

  const fetchOrder = async () => {
    try {
      const result = await getVendorOrderById(params.id as string);
      if (result.success && result.data) {
        setOrder(result.data);
      } else {
        toast.error(result.error || "Order not found");
        router.push("/vendor/orders");
      }
    } catch (error) {
      toast.error("Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleStatusChange = async (status: any) => {
    if (!order) return;
    try {
      const result = await updateOrderStatus(order.id, status);
      if (result.success) {
        toast.success("Order status updated");
        fetchOrder();
      } else if (result.requiresRefund) {
        // Order has payment, need to process refund
        toast.info("Processing refund...");
        try {
          const refundResponse = await fetch("/api/payment/refund", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: order.id,
              reason: "Vendor cancelled the order",
              isVendor: true,
            }),
          });

          const refundResult = await refundResponse.json();

          if (refundResult.success) {
            toast.success(
              refundResult.refund
                ? `Order cancelled. Refund of Rs. ${refundResult.refund.amount} initiated.`
                : "Order cancelled successfully",
            );
            fetchOrder();
          } else {
            toast.error(refundResult.error || "Failed to process refund");
          }
        } catch (refundError) {
          toast.error("Failed to process refund. Please try again.");
        }
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleCreateInvoice = async () => {
    if (!order) return;
    try {
      const result = await createInvoice(order.id);
      if (result.success) {
        toast.success("Invoice created successfully");
        router.push("/vendor/invoices");
      } else {
        toast.error(result.error || "Failed to create invoice");
      }
    } catch (error) {
      toast.error("Failed to create invoice");
    }
  };

  const generateInvoicePDF = () => {
    if (!order) return null;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const subtotal = order.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );
    const taxAmount = subtotal * 0.18;
    const totalAmount = subtotal + taxAmount;

    const customerName =
      [order.customer.firstName, order.customer.lastName]
        .filter(Boolean)
        .join(" ") || "Customer";

    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("RentNow", 20, 22);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("RENTAL ORDER", 20, 32);

    doc.setFontSize(10);
    doc.text(`Order #: ${order.orderNumber}`, pageWidth - 20, 22, {
      align: "right",
    });
    doc.text(
      `Date: ${format(new Date(order.createdAt), "dd MMM yyyy")}`,
      pageWidth - 20,
      30,
      { align: "right" },
    );

    doc.setTextColor(0, 0, 0);

    let yPos = 55;

    // Order Info
    doc.setFillColor(248, 250, 252);
    doc.rect(15, yPos - 5, pageWidth - 30, 25, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Order Details", 20, yPos + 3);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Order ID: ${order.orderNumber}`, 20, yPos + 12);
    doc.text(
      `Order Date: ${format(new Date(order.createdAt), "dd MMM yyyy")}`,
      80,
      yPos + 12,
    );
    doc.text(`Status: ${order.status}`, 150, yPos + 12);

    yPos += 35;

    // Customer Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    yPos += 6;
    doc.text(customerName, 20, yPos);
    if (order.customer.email) {
      yPos += 5;
      doc.text(order.customer.email, 20, yPos);
    }
    if (order.customer.phone) {
      yPos += 5;
      doc.text(order.customer.phone, 20, yPos);
    }

    if (order.address) {
      yPos += 8;
      doc.setFont("helvetica", "bold");
      doc.text("Delivery Address:", 20, yPos);
      doc.setFont("helvetica", "normal");
      yPos += 5;
      doc.text(order.address.addressLine1, 20, yPos);
      if (order.address.addressLine2) {
        yPos += 5;
        doc.text(order.address.addressLine2, 20, yPos);
      }
      yPos += 5;
      doc.text(
        `${order.address.city}, ${order.address.state} - ${order.address.postalCode}`,
        20,
        yPos,
      );
    }

    yPos += 15;

    // Items Table
    const tableData = order.items.map((item, index) => [
      (index + 1).toString(),
      item.productName,
      `${format(new Date(item.rentalStartDate), "dd/MM/yy")} - ${format(new Date(item.rentalEndDate), "dd/MM/yy")}`,
      item.quantity.toString(),
      `Rs. ${item.unitPrice.toLocaleString()}`,
      "18%",
      `Rs. ${item.totalPrice.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [
        ["#", "Product", "Rental Period", "Qty", "Unit Price", "Tax", "Total"],
      ],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 45 },
        2: { cellWidth: 35, halign: "center" },
        3: { cellWidth: 15, halign: "center" },
        4: { cellWidth: 25, halign: "right" },
        5: { cellWidth: 15, halign: "center" },
        6: { cellWidth: 30, halign: "right" },
      },
      margin: { left: 15, right: 15 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Summary
    const summaryStartX = pageWidth - 85;
    const summaryWidth = 70;

    doc.setFillColor(248, 250, 252);
    doc.rect(summaryStartX - 5, yPos - 3, summaryWidth + 10, 55, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    doc.text("Subtotal:", summaryStartX, yPos + 5);
    doc.text(
      `Rs. ${subtotal.toLocaleString()}`,
      summaryStartX + summaryWidth,
      yPos + 5,
      { align: "right" },
    );

    doc.text("GST (18%):", summaryStartX, yPos + 13);
    doc.text(
      `Rs. ${taxAmount.toLocaleString()}`,
      summaryStartX + summaryWidth,
      yPos + 13,
      { align: "right" },
    );

    doc.text("Discount:", summaryStartX, yPos + 21);
    doc.text("Rs. 0", summaryStartX + summaryWidth, yPos + 21, {
      align: "right",
    });

    const totalY = yPos + 33;
    doc.setDrawColor(79, 70, 229);
    doc.line(
      summaryStartX - 5,
      totalY - 5,
      summaryStartX + summaryWidth + 5,
      totalY - 5,
    );
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Total:", summaryStartX, totalY + 3);
    doc.setTextColor(79, 70, 229);
    doc.text(
      `Rs. ${totalAmount.toLocaleString()}`,
      summaryStartX + summaryWidth,
      totalY + 3,
      { align: "right" },
    );

    doc.setTextColor(0, 0, 0);

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 30;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);

    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("Terms & Conditions:", 20, footerY);
    doc.text(
      "1. Rental items must be returned in good condition.",
      20,
      footerY + 6,
    );
    doc.text("2. Late returns may incur additional charges.", 20, footerY + 11);
    doc.text("3. This is a computer-generated document.", 20, footerY + 16);

    doc.text(
      "RentNow | support@rentnow.com | +91-9876543210",
      pageWidth / 2,
      footerY + 24,
      { align: "center" },
    );

    return doc;
  };

  const handleDownloadInvoice = () => {
    if (!order) return;

    try {
      const doc = generateInvoicePDF();
      if (doc) {
        doc.save(`Order_${order.orderNumber}.pdf`);
        toast.success("Invoice downloaded successfully!");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate invoice");
    }
  };

  const handlePrint = () => {
    if (!order) return;

    const subtotal = order.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );
    const taxAmount = subtotal * 0.18;
    const totalAmount = subtotal + taxAmount;

    const customerName =
      [order.customer.firstName, order.customer.lastName]
        .filter(Boolean)
        .join(" ") || "Customer";

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups for printing");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order ${order.orderNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1f2937; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #6366f1; }
            .company h1 { font-size: 28px; color: #6366f1; }
            .company p { color: #6b7280; }
            .invoice-info { text-align: right; }
            .invoice-info h2 { font-size: 24px; color: #6366f1; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
            .details h3 { font-size: 12px; text-transform: uppercase; color: #9ca3af; margin-bottom: 8px; }
            .details p { margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #6366f1; color: white; padding: 12px; text-align: left; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
            .totals { width: 300px; margin-left: auto; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .totals-row.total { border-top: 2px solid #e5e7eb; font-weight: bold; font-size: 18px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="company">
                <h1>RentNow</h1>
                <p>Rental Services</p>
              </div>
              <div class="invoice-info">
                <h2>RENTAL ORDER</h2>
                <p>${order.orderNumber}</p>
                <p>${format(new Date(order.createdAt), "dd MMM yyyy")}</p>
              </div>
            </div>

            <div class="details">
              <div>
                <h3>Bill To</h3>
                <p><strong>${customerName}</strong></p>
                <p>${order.customer.email || ""}</p>
                <p>${order.customer.phone || ""}</p>
              </div>
              <div style="text-align: right;">
                <h3>Delivery Address</h3>
                ${order.address
        ? `
                  <p>${order.address.addressLine1}</p>
                  ${order.address.addressLine2 ? `<p>${order.address.addressLine2}</p>` : ""}
                  <p>${order.address.city}, ${order.address.state} - ${order.address.postalCode}</p>
                `
        : "<p>Self Pickup</p>"
      }
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Rental Period</th>
                  <th>Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Tax</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
        .map(
          (item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.productName}</td>
                    <td>${format(new Date(item.rentalStartDate), "dd/MM/yy")} - ${format(new Date(item.rentalEndDate), "dd/MM/yy")}</td>
                    <td>${item.quantity}</td>
                    <td style="text-align: right;">₹${item.unitPrice.toLocaleString()}</td>
                    <td style="text-align: right;">18%</td>
                    <td style="text-align: right;">₹${item.totalPrice.toLocaleString()}</td>
                  </tr>
                `,
        )
        .join("")}
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-row">
                <span>Subtotal</span>
                <span>₹${subtotal.toLocaleString()}</span>
              </div>
              <div class="totals-row">
                <span>GST (18%)</span>
                <span>₹${taxAmount.toLocaleString()}</span>
              </div>
              <div class="totals-row">
                <span>Discount</span>
                <span>₹0</span>
              </div>
              <div class="totals-row total">
                <span>Total</span>
                <span>₹${totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div class="footer">
              <p>Thank you for your business!</p>
              <p style="margin-top: 10px;">RentNow | support@rentnow.com | +91-9876543210</p>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  const handleSendEmail = async () => {
    if (!order || !order.customer.email) {
      toast.error("Customer email not available");
      return;
    }

    setSendingEmail(true);

    try {
      const response = await fetch("/api/orders/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Invoice sent to ${order.customer.email}`);
      } else {
        toast.error(result.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Order not found</p>
        <Button asChild className="mt-4">
          <Link href="/vendor/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = subtotal * 0.18;
  const totalAmount = subtotal + taxAmount;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between sticky top-0 z-10 bg-white dark:bg-slate-900 pb-4 pt-4 px-2 -mx-2 border-b border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/vendor/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Rental Order</h1>
              <Badge className={statusColors[order.status]}>
                {statusLabels[order.status]}
              </Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400">{order.orderNumber}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendEmail}
            disabled={sendingEmail || !order.customer.email}
          >
            {sendingEmail ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {sendingEmail ? "Sending..." : "Send"}
          </Button>
          {order.status === "DRAFT" && (
            <Button size="sm" onClick={() => handleStatusChange("CONFIRMED")} className="bg-sky-500 hover:bg-sky-600 text-white">
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadInvoice}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          {(order.status === "CONFIRMED" || order.status === "IN_PROGRESS") && (
            <Button size="sm" onClick={handleCreateInvoice} className="bg-sky-500 hover:bg-sky-600 text-white border-transparent">
              <FileText className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange("CANCELLED")}
                  className="text-red-600"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Order
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <Button
          variant={order.status === "DRAFT" ? "default" : "ghost"}
          size="sm"
          className={order.status === "DRAFT" ? "bg-sky-500 hover:bg-sky-600 text-white" : ""}
        >
          Quotation
        </Button>
        <Button
          variant={order.status === "CONFIRMED" ? "default" : "ghost"}
          size="sm"
          className={order.status === "CONFIRMED" ? "bg-sky-500 hover:bg-sky-600 text-white" : ""}
        >
          Quotation Sent
        </Button>
        <Button
          variant={order.status === "IN_PROGRESS" ? "default" : "ghost"}
          size="sm"
          className={order.status === "IN_PROGRESS" ? "bg-sky-500 hover:bg-sky-600 text-white" : ""}
        >
          Sale Order
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Customer:</span>
                  <span>
                    {order.customer.firstName} {order.customer.lastName}
                  </span>
                </div>
                {order.customer.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Mail className="h-4 w-4 text-sky-500" />
                    {order.customer.email}
                  </div>
                )}
                {order.customer.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Phone className="h-4 w-4 text-sky-500" />
                    {order.customer.phone}
                  </div>
                )}
              </div>
              {order.address && (
                <div className="space-y-1">
                  <span className="font-medium text-sm">Delivery Address:</span>
                  <div className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin className="h-4 w-4 mt-0.5 text-sky-500" />
                    <div>
                      <p>{order.address.addressLine1}</p>
                      {order.address.addressLine2 && (
                        <p>{order.address.addressLine2}</p>
                      )}
                      <p>
                        {order.address.city}, {order.address.state} -{" "}
                        {order.address.postalCode}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rental Period */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rental Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-sky-500" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Start Date</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {order.items[0]
                        ? format(
                          new Date(order.items[0].rentalStartDate),
                          "PPP",
                        )
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-sky-500" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">End Date</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {order.items[0]
                        ? format(new Date(order.items[0].rentalEndDate), "PPP")
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Lines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Lines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">
                        Product
                      </th>
                      <th className="text-center p-3 text-sm font-medium">
                        Quantity
                      </th>
                      <th className="text-center p-3 text-sm font-medium">
                        Unit
                      </th>
                      <th className="text-right p-3 text-sm font-medium">
                        Unit Price
                      </th>
                      <th className="text-right p-3 text-sm font-medium">
                        Taxes
                      </th>
                      <th className="text-right p-3 text-sm font-medium">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-10 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <span className="font-medium">
                              {item.productName}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-center">Units</td>
                        <td className="p-3 text-right">
                          ₹{item.unitPrice.toLocaleString()}
                        </td>
                        <td className="p-3 text-right">18%</td>
                        <td className="p-3 text-right font-medium">
                          ₹{item.totalPrice.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add product link */}
              <div className="mt-3">
                <Button variant="link" className="p-0 h-auto text-primary">
                  Add a Product
                </Button>
                <span className="mx-2 text-muted-foreground">|</span>
                <Button
                  variant="link"
                  className="p-0 h-auto text-muted-foreground"
                >
                  Add a note
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Terms & Conditions:</span>{" "}
                <a href="#" className="text-primary underline">
                  https://xxxxx.xxx.xxx/terms
                </a>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                There should be a separate page for the standard terms and
                conditions of renting a product
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>-</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Untaxed Amount</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST (18%)</span>
                <span>₹{taxAmount.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Order Created</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), "PPp")}
                    </p>
                  </div>
                </div>
                {order.status !== "DRAFT" && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Order Confirmed</p>
                      <p className="text-xs text-muted-foreground">
                        Status updated
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Important Note */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> When a Quotation gets confirmed it
                becomes a Sale Order/Rental Order and the status should change
                to Sale Order
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
