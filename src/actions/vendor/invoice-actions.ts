"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { UserRole, InvoiceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getVendorInvoices() {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.VENDOR) {
    return { error: "Unauthorized" };
  }

  try {
    const invoices = await db.invoice.findMany({
      where: {
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
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        order: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return { invoices };
  } catch (error) {
    return { error: "Failed to fetch invoices" };
  }
}

export async function createInvoiceFromOrder(orderId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.VENDOR) {
    return { error: "Unauthorized" };
  }

  try {
    const order = await db.rentalOrder.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) return { error: "Order not found" };

    const invoiceNumber = "INV-" + Date.now();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 7 days from now

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        customerId: order.customerId,
        status: InvoiceStatus.DRAFT,
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        totalAmount: order.totalAmount,
        dueDate,
        items: {
          create: order.items.map(item => ({
            description: "Rental Item", // Simplified
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          }))
        }
      }
    });

    revalidatePath("/dashboard/vendor/invoices");
    return { success: "Invoice created", invoice };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create invoice" };
  }
}

export async function getOrderForInvoice(orderId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.VENDOR) {
    return { error: "Unauthorized" };
  }

  try {
    const order = await db.rentalOrder.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) return { error: "Order not found" };

    return { order };
  } catch (error) {
    return { error: "Failed to fetch order" };
  }
}
