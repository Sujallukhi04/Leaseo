"use server";
import { db } from "@/lib/db";
import { InvoiceStatus } from "@prisma/client";

export const generateInvoice = async (orderId: string) => {
  const order = await db.rentalOrder.findUnique({
    where: { id: orderId },
    include: { items: true, customer: true }
  });

  if (!order) return { error: "Order not found" };

  // Create the Invoice record
  const invoice = await db.invoice.create({
    data: {
      invoiceNumber: `INV-${Date.now()}`,
      orderId: order.id,
      customerId: order.customerId,
      status: InvoiceStatus.SENT,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
      items: {
        create: order.items.map((item) => ({
          description: `Rental: Product ID ${item.productId}`,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      },
    },
  });

  return { success: "Invoice generated successfully", invoiceId: invoice.id };
};