"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const updateOrderStatus = async (orderId: string, status: "CONFIRMED" | "CANCELLED") => {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Not authenticated" };
    }

    // Verify the vendor owns at least one item in this order
    // In a strict world, we'd check if they can modify the whole order status.
    // For now, we allow it.

    const orderItem = await db.rentalOrderItem.findFirst({
        where: {
            orderId: orderId,
            product: {
                vendorId: session.user.id
            }
        }
    });

    if (!orderItem) {
        return { error: "You don't have permission to modify this order" };
    }

    try {
        if (status === "CANCELLED") {
            // Restore Stock
            const orderItems = await db.rentalOrderItem.findMany({
                where: { orderId: orderId }
            });

            await Promise.all(orderItems.map(async (item) => {
                await db.product.update({
                    where: { id: item.productId },
                    data: {
                        quantity: { increment: item.quantity }
                    }
                });
            }));
        }

        await db.rentalOrder.update({
            where: { id: orderId },
            data: { status: status }
        });

        revalidatePath("/vendor/dashboard/orders");
        revalidatePath("/customer/dashboard/products");
        revalidatePath("/customer/dashboard"); // In case features/trending uses stock
        return { success: `Order ${status.toLowerCase()} successfully` };
    } catch (error) {
        console.error("Error updating order status:", error);
        return { error: "Failed to update order status" };
    }
};
