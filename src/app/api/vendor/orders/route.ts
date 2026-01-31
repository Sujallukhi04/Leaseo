import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch confirmed/active orders for analytics
        const orders = await db.rentalOrder.findMany({
            where: {
                items: {
                    some: {
                        product: {
                            vendorId: session.user.id
                        }
                    }
                },
                status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                payments: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        // Calculate metrics
        const totalOrders = orders.length;
        let totalRevenue = 0;
        let activeRentals = 0;

        orders.forEach(order => {
            // Logic for specific vendor revenue part could be complex if multiple vendors per order
            // Assuming for now simplified logic: sum of items belonging to this vendor
            order.items.forEach(item => {
                if (item.product.vendorId === session.user.id) {
                    totalRevenue += Number(item.totalPrice);
                }
            });

            if (order.status === "IN_PROGRESS") {
                activeRentals++;
            }
        });

        // Example Chart Data (Last 6 Months) - Placeholder logic for now
        const monthlyRevenue = [
            { name: "Jan", total: 0 },
            { name: "Feb", total: 0 },
            { name: "Mar", total: 0 },
            { name: "Apr", total: 0 },
            { name: "May", total: 0 },
            { name: "Jun", total: 0 },
        ];
        // Populate monthlyRevenue based on real data if needed in future

        return NextResponse.json({
            totalRevenue,
            totalOrders,
            activeRentals,
            monthlyRevenue
        });

    } catch (error) {
        console.error("[VENDOR_ORDERS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
