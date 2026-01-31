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
        await db.rentalOrder.update({
            where: { id: orderId },
            data: { status: status }
        });

        revalidatePath("/vendor/dashboard/orders");
        return { success: `Order ${status.toLowerCase()} successfully` };
    } catch (error) {
        console.error("Error updating order status:", error);
        return { error: "Failed to update order status" };
    }
};
