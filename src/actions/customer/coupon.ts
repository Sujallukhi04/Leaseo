"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const validateCoupon = async (code: string, subtotal: number) => {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Not authenticated" };
    }

    try {
        const coupon = await db.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!coupon) {
            // For testing purposes, let's create WELCOME10 if it doesn't exist
            if (code.toUpperCase() === 'WELCOME10') {
                const newCoupon = await db.coupon.create({
                    data: {
                        code: 'WELCOME10',
                        discountType: 'PERCENTAGE',
                        discountValue: 10,
                        validFrom: new Date(),
                        validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                        description: 'First time user discount'
                    }
                });
                return processCoupon(newCoupon, subtotal, session.user.id);
            }
            return { error: "Invalid coupon code" };
        }

        return processCoupon(coupon, subtotal, session.user.id);

    } catch (error) {
        console.error("Coupon error:", error);
        return { error: "Failed to validate coupon" };
    }
};

const processCoupon = async (coupon: any, subtotal: number, userId: string) => {
    // Check validity
    if (!coupon.isActive) return { error: "Coupon is inactive" };
    if (new Date() < coupon.validFrom || new Date() > coupon.validUntil) return { error: "Coupon expired" };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { error: "Coupon usage limit reached" };

    // Check minimum order value
    if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
        return { error: `Minimum order value of ${coupon.minOrderValue} required` };
    }

    // Check ownership (Strict binding)
    // NOTE: TypeScript usage assume allowedUserId can be accessed (after re-generation)
    if ((coupon as any).allowedUserId && (coupon as any).allowedUserId !== userId) {
        return { error: "This coupon is not valid for your account" };
    }

    // Check "Welcome Gift" Strict First Order rule
    // We identify welcome coupons by description or a specific metadata flag if we had one.
    // 'Welcome Gift - 10% Off First Rental' is the description we used.
    if (coupon.description?.includes("Welcome Gift") || coupon.code.startsWith("LEASEO-")) {
        // Technically "LEASEO-" is our Welcome prefix, but let's be safe with description
        const orderCount = await db.rentalOrder.count({
            where: { customerId: userId }
        });
        if (orderCount > 0) {
            return { error: "This coupon is valid for first orders only" };
        }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
        if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
            discountAmount = Number(coupon.maxDiscount);
        }
    } else {
        discountAmount = Number(coupon.discountValue);
    }

    return {
        success: true,
        couponCode: coupon.code,
        discountAmount: discountAmount,
        message: `${coupon.discountType === 'PERCENTAGE' ? coupon.discountValue + '%' : 'Flat'} discount applied`
    };
};
