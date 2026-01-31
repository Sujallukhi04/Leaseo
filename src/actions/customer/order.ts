"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export const createOrder = async () => {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return { error: "Not authenticated" };
    }

    const userId = session.user.id;

    try {
        // 1. Get Cart
        const cart = await db.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!cart || cart.items.length === 0) {
            return { error: "Cart is empty" };
        }

        // 2. Calculate Totals
        const subtotal = cart.items.reduce((sum, item) => {
            return sum + (Number(item.product.basePrice) * item.quantity);
        }, 0);

        const taxAmount = subtotal * 0.18;
        const totalAmount = subtotal + taxAmount;

        // 3. Create Order
        // Generate a random order number for now. In prod, use a sequence or UUID.
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const order = await db.rentalOrder.create({
            data: {
                customerId: userId,
                orderNumber: orderNumber,
                status: "DRAFT",
                subtotal: subtotal,
                taxAmount: taxAmount,
                totalAmount: totalAmount,
                items: {
                    create: cart.items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.product.basePrice,
                        totalPrice: Number(item.product.basePrice) * item.quantity,
                        rentalStartDate: item.rentalStartDate,
                        rentalEndDate: item.rentalEndDate,
                        periodType: item.periodType,
                        periodDuration: 1 // Defaulting to 1 for now if not in cart item
                    }))
                }
            }
        });

        // 4. Clear Cart
        await db.cartItem.deleteMany({
            where: {
                cartId: cart.id
            }
        });

        return { success: "Order placed successfully!", orderId: order.id };

    } catch (error: any) {
        console.error("Error creating order:", error);
        return { error: error.message || "Failed to create order" };
    }
};
