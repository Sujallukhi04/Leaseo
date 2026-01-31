"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { UserRole, OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getVendorOrders() {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.VENDOR) {
    return { error: "Unauthorized" };
  }

  try {
    // Orders that contain products from this vendor
    const orders = await db.rentalOrder.findMany({
      where: {
        items: {
          some: {
            product: {
              vendorId: session.user.id
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
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return { orders };
  } catch (error) {
    return { error: "Failed to fetch orders" };
  }
}

export async function createRentalOrder(data: any) {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.VENDOR) {
    return { error: "Unauthorized" };
  }

  try {
    const orderNumber = "ORD-" + Date.now();

    // If request asks for immediate confirmation, perform availability checks
    const shouldConfirm = data.status === "confirmed" || data.confirm === true;

    if (shouldConfirm) {
      // Use serializable transaction to avoid race conditions during reservation
      const result = await db.$transaction(async (tx) => {
        // Check availability for each item
        for (const item of data.items) {
          const start = new Date(item.rentalStartDate);
          const end = new Date(item.rentalEndDate);

          // Total inventory for this product/variant in warehouse
          const inventoryAgg = await tx.inventory.aggregate({
            _sum: { quantity: true },
            where: {
              productId: item.productId,
              variantId: item.variantId || null,
              location: "IN_WAREHOUSE"
            }
          });
          const inventoryQty = Number(inventoryAgg._sum.quantity ?? 0);

          // Sum of overlapping active reservations
          const reservedAgg = await tx.reservation.aggregate({
            _sum: { quantity: true },
            where: {
              productId: item.productId,
              variantId: item.variantId || null,
              isActive: true,
              AND: [
                { startDate: { lt: end } },
                { endDate: { gt: start } }
              ]
            }
          });
          const reservedQty = Number(reservedAgg._sum.quantity ?? 0);

          const available = inventoryQty - reservedQty;

          if (available < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.productId}. Available: ${available}`);
          }
        }

        // All checks passed, create order and reservations
        const order = await tx.rentalOrder.create({
          data: {
            orderNumber,
            customerId: data.customerId,
            status: OrderStatus.CONFIRMED,
            subtotal: data.subtotal,
            totalAmount: data.totalAmount,
            notes: data.notes,
            confirmedAt: new Date(),
            items: {
              create: data.items.map((item: any) => ({
                productId: item.productId,
                variantId: item.variantId || null,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                rentalStartDate: new Date(item.rentalStartDate),
                rentalEndDate: new Date(item.rentalEndDate),
                periodType: item.periodType,
                periodDuration: item.periodDuration
              }))
            }
          }
        });

        // Create reservation records linked to the order
        for (const item of data.items) {
          await tx.reservation.create({
            data: {
              productId: item.productId,
              variantId: item.variantId || null,
              orderId: order.id,
              quantity: item.quantity,
              startDate: new Date(item.rentalStartDate),
              endDate: new Date(item.rentalEndDate),
              isActive: true
            }
          });
        }

        return order;
      }, { isolationLevel: "Serializable" });

      revalidatePath("/dashboard/vendor/orders");
      return { success: "Order confirmed and reservations created", order: result };
    }

    // Default behavior: create as draft order
    const order = await db.rentalOrder.create({
      data: {
        orderNumber,
        customerId: data.customerId,
        status: OrderStatus.DRAFT,
        subtotal: data.subtotal,
        totalAmount: data.totalAmount,
        notes: data.notes,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            rentalStartDate: new Date(item.rentalStartDate),
            rentalEndDate: new Date(item.rentalEndDate),
            periodType: item.periodType,
            periodDuration: item.periodDuration
          }))
        }
      }
    });

    revalidatePath("/dashboard/vendor/orders");
    return { success: "Order created", order };
  } catch (error: any) {
    console.error(error);
    return { error: error?.message || "Failed to create order" };
  }
}

export async function checkProductAvailability(data: { productId: string; variantId?: string | null; rentalStartDate: string; rentalEndDate: string; }) {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.VENDOR) {
    return { error: "Unauthorized" };
  }

  try {
    const start = new Date(data.rentalStartDate);
    const end = new Date(data.rentalEndDate);

    const inventoryAgg = await db.inventory.aggregate({
      _sum: { quantity: true },
      where: {
        productId: data.productId,
        variantId: data.variantId || null,
        location: "IN_WAREHOUSE"
      }
    });

    const reservedAgg = await db.reservation.aggregate({
      _sum: { quantity: true },
      where: {
        productId: data.productId,
        variantId: data.variantId || null,
        isActive: true,
        AND: [
          { startDate: { lt: end } },
          { endDate: { gt: start } }
        ]
      }
    });

    const inventoryQty = Number(inventoryAgg._sum.quantity ?? 0);
    const reservedQty = Number(reservedAgg._sum.quantity ?? 0);
    const available = inventoryQty - reservedQty;

    return { available };
  } catch (error) {
    console.error(error);
    return { error: "Failed to check availability" };
  }
}

export async function confirmRentalOrder(orderId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.VENDOR) {
    return { error: "Unauthorized" };
  }

  try {
    const order = await db.rentalOrder.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    });

    if (!order) return { error: "Order not found" };

    // Ensure vendor owns all products in order
    for (const item of order.items) {
      if (item.product.vendorId !== session.user.id) {
        return { error: "You are not authorized to confirm this order" };
      }
    }

    const result = await db.$transaction(async (tx) => {
      for (const item of order.items) {
        const start = item.rentalStartDate;
        const end = item.rentalEndDate;

        const inventoryAgg = await tx.inventory.aggregate({
          _sum: { quantity: true },
          where: {
            productId: item.productId,
            variantId: item.variantId || null,
            location: "IN_WAREHOUSE"
          }
        });
        const inventoryQty = Number(inventoryAgg._sum.quantity ?? 0);

        const reservedAgg = await tx.reservation.aggregate({
          _sum: { quantity: true },
          where: {
            productId: item.productId,
            variantId: item.variantId || null,
            isActive: true,
            AND: [
              { startDate: { lt: end } },
              { endDate: { gt: start } }
            ]
          }
        });
        const reservedQty = Number(reservedAgg._sum.quantity ?? 0);

        const available = inventoryQty - reservedQty;
        if (available < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}. Available: ${available}`);
        }
      }

      const updatedOrder = await tx.rentalOrder.update({
        where: { id: orderId },
        data: { status: OrderStatus.CONFIRMED, confirmedAt: new Date() }
      });

      for (const item of order.items) {
        await tx.reservation.create({
          data: {
            productId: item.productId,
            variantId: item.variantId || null,
            orderId: orderId,
            quantity: item.quantity,
            startDate: item.rentalStartDate,
            endDate: item.rentalEndDate,
            isActive: true
          }
        });
      }

      return updatedOrder;
    }, { isolationLevel: "Serializable" });

    revalidatePath("/dashboard/vendor/orders");
    return { success: "Order confirmed and reservations created", order: result };
  } catch (error: any) {
    console.error(error);
    return { error: error?.message || "Failed to confirm order" };
  }
}
