"use server";

import { db } from "@/lib/db";

export async function getAdminRentalOrders() {
    try {
        const orders = await db.rentalOrder.findMany({
            include: {
                customer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        image: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                images: {
                                    where: { isPrimary: true },
                                    take: 1,
                                    select: { url: true },
                                },
                            },
                        },
                    },
                },
                invoices: {
                    select: {
                        status: true,
                        totalAmount: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        const safeOrders = JSON.parse(JSON.stringify(orders));
        return { success: true, data: safeOrders };
    } catch (error) {
        console.error("Failed to fetch admin rental orders:", error);
        return { success: false, error: "Failed to fetch orders" };
    }
}

export async function getAdminProducts() {
    try {
        const products = await db.product.findMany({
            include: {
                category: {
                    select: { name: true },
                },
                vendor: {
                    select: { companyName: true, firstName: true, lastName: true },
                },
                images: {
                    take: 1,
                    orderBy: {
                        isPrimary: 'desc',
                    },
                    select: { url: true },
                },
                _count: {
                    select: {
                        orderItems: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        const safeProducts = JSON.parse(JSON.stringify(products));
        return { success: true, data: safeProducts };
    } catch (error) {
        console.error("Failed to fetch admin products:", error);
        return { success: false, error: "Failed to fetch products" };
    }
}
