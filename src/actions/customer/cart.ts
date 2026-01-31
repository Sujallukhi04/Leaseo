"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const getCart = async () => {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return { error: "Not authenticated" };
    }

    const userId = session.user.id;

    try {
        const cart = await db.cart.findUnique({
            where: {
                userId: userId,
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc' // Keep consistent order
                    }
                }
            }
        });

        if (!cart) {
            return { cart: null };
        }

        const serializedCart = {
            ...cart,
            items: cart.items.map((item: any) => ({
                ...item,
                product: {
                    ...item.product,
                    costPrice: Number(item.product.costPrice),
                    basePrice: Number(item.product.basePrice),
                    securityDeposit: Number(item.product.securityDeposit),
                }
            }))
        };

        return { cart: serializedCart };
    } catch (error) {
        console.error("Error fetching cart:", error);
        return { error: "Failed to fetch cart" };
    }
};

export const addToCart = async (productId: string, quantity: number, startDate: Date, endDate: Date) => {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return { error: "Not authenticated" };
    }

    const userId = session.user.id;

    try {
        let cart = await db.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            cart = await db.cart.create({
                data: { userId },
            });
        }

        await db.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity,
                rentalStartDate: startDate,
                rentalEndDate: endDate,
                periodType: "DAILY",
            },
        });

        revalidatePath("/customer/cart");
        revalidatePath("/customer/checkout");
        return { success: "Added to cart" };
    } catch (error) {
        console.error("Error adding to cart:", error);
        return { error: "Failed to add to cart" };
    }
};

export const removeFromCart = async (cartItemId: string) => {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return { error: "Not authenticated" };
    }

    try {
        await db.cartItem.delete({
            where: {
                id: cartItemId,
            },
        });

        revalidatePath("/customer/cart");
        revalidatePath("/customer/checkout");
        return { success: "Removed from cart" };
    } catch (error) {
        console.error("Error removing from cart:", error);
        return { error: "Failed to remove from cart" };
    }
};

export const updateCartItemQuantity = async (cartItemId: string, newQuantity: number) => {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return { error: "Not authenticated" };
    }

    try {
        if (newQuantity <= 0) {
            return removeFromCart(cartItemId);
        }

        await db.cartItem.update({
            where: { id: cartItemId },
            data: { quantity: newQuantity }
        });

        revalidatePath("/customer/cart");
        revalidatePath("/customer/checkout");
        return { success: "Updated quantity" };
    } catch (error) {
        console.error("Error updating cart quantity:", error);
        return { error: "Failed to update quantity" };
    }
};
