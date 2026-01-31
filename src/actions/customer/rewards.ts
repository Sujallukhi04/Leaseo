"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { auth } from "@/auth";


// Helper to generate secure random code
function generateSecureCouponCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars like I, 1, O, 0
    const length = 8;
    const bytes = crypto.randomBytes(length);
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars[bytes[i] % chars.length];
    }
    return `LEASEO-${result}`;
}

// Standalone action to check and grant reward if eligible
export const checkAndGrantWelcomeReward = async () => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return { error: "Not authenticated" };
        }
        const userId = session.user.id;

        // Use transaction to ensure atomicity and prevent race conditions (duplicate coupons)
        return await db.$transaction(async (tx) => {
            // 1. Lock/Fetch User State inside TX to see latest data
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: { rentalOrders: true }
            });

            if (!user) return { error: "User not found" };

            // 2. Strict Eligibility Check
            // If flag is true OR they have orders, they are not eligible.
            if (user.isFirstOrderRewardGranted || user.rentalOrders.length > 0) {
                return {
                    success: false,
                    reason: "Already granted or not eligible",
                    couponCode: user.couponCode
                };
            }

            // 3. Generate Secure Code
            let couponCode = generateSecureCouponCode();
            let isUnique = false;
            let attempts = 0;

            while (!isUnique && attempts < 5) {
                const existing = await tx.coupon.findUnique({ where: { code: couponCode } });
                if (!existing) isUnique = true;
                else {
                    couponCode = generateSecureCouponCode();
                    attempts++;
                }
            }

            if (!isUnique) throw new Error("Could not generate unique code");

            // 4. Create Records
            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + 30); // 30 Days

            const coupon = await tx.coupon.create({
                data: {
                    code: couponCode,
                    description: "Welcome Gift - 10% Off First Rental",
                    discountType: "PERCENTAGE",
                    discountValue: 10,
                    allowedUserId: userId,
                    usageLimit: 1, // One-time use
                    validFrom: new Date(),
                    validUntil: validUntil,
                    isActive: true,
                },
            });

            await tx.notification.create({
                data: {
                    userId: userId,
                    title: "🎉 Welcome Gift!",
                    message: `Use coupon ${couponCode} to get 10% OFF on this order!`,
                    type: "WELCOME_REWARD",
                    isRead: false,
                    metadata: { couponCode, couponId: coupon.id },
                },
            });

            await tx.user.update({
                where: { id: userId },
                data: {
                    isFirstOrderRewardGranted: true,
                    couponCode: couponCode
                }
            });

            return { success: true, couponCode };
        });

    } catch (e) {
        console.error("Error granting reward:", e);
        return { error: "Failed to grant reward" };
    }
};
