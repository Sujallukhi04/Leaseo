"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
// Add coupon validation import if we want to share logic, or re-implement simple check.
// Since server action imports can be tricky, let's keep it simple or re-import.
import { validateCoupon } from "./coupon";

// ... existing imports ...
import { grantFirstOrderRewardRecursive } from "./rewards";

export const createOrder = async (couponCode?: string) => {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return { error: "Not authenticated" };
    }

    const userId = session.user.id;

    try {
        // Use Interactive Transaction for Atomicity
        const result = await db.$transaction(async (tx) => {
            // 1. Get Cart (Read)
            // Note: In strict locking we might want to lock user/cart rows, 
            // but Prisma lacks 'SELECT FOR UPDATE' easily. 
            // We rely on optimistic checks or atomic updates.
            const cart = await tx.cart.findUnique({
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
                throw new Error("Cart is empty");
            }

            // 2. Calculate Totals
            const subtotal = cart.items.reduce((sum, item) => {
                return sum + (Number(item.product.basePrice) * item.quantity);
            }, 0);

            let discountAmount = 0;
            let appliedCouponId = null;

            // Apply Coupon if exists
            if (couponCode) {
                // Re-validate strictly inside transaction to prevent 'double usage' race conditions
                // We do a manual check here because calling 'validateCoupon' (outside tx) isn't safe enough for the 'usage check'
                const coupon = await tx.coupon.findUnique({ where: { code: couponCode } });

                if (coupon) {
                    // Basic validation logic
                    if (!coupon.isActive) throw new Error("Coupon is inactive");
                    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new Error("Coupon usage limit reached");
                    if ((coupon as any).allowedUserId && (coupon as any).allowedUserId !== userId) throw new Error("Invalid coupon");

                    // Calculate
                    if (coupon.discountType === 'PERCENTAGE') {
                        discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
                    } else {
                        discountAmount = Number(coupon.discountValue);
                    }
                    appliedCouponId = coupon.id;
                }
            }

            const taxAmount = subtotal * 0.18;
            const totalAmount = subtotal + taxAmount - discountAmount;

            // 3. Create Order
            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const order = await tx.rentalOrder.create({
                data: {
                    customerId: userId,
                    orderNumber: orderNumber,
                    status: "DRAFT", // Or CONFIRMED depending on flow
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
                            periodDuration: 1
                        }))
                    }
                }
            });

            // 4. Clear Cart
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id }
            });

            // 5. Update Coupon Usage
            if (appliedCouponId) {
                await tx.coupon.update({
                    where: { id: appliedCouponId },
                    data: { usedCount: { increment: 1 } }
                });
            }

            return order;
        });

        return { success: "Order placed successfully!", orderId: result.id };

    } catch (error: any) {
        console.error("Error creating order:", error);
        return { error: error.message || "Failed to create order" };
    }
};
