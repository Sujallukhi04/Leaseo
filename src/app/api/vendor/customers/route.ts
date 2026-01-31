import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db as prisma } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "VENDOR") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query") || "";

        const customers = await prisma.user.findMany({
            where: {
                role: "CUSTOMER", // Basic filter
                // In a real scenario, filtering by actual orders related to vendor is heavy, keeping it simple for now
                OR: [
                    { firstName: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                ]
            },
            take: 20,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                image: true
            }
        });

        // Filter customers who actually ordered from this vendor
        // We do this in JS to avoid complex nested queries if possible, or refine query above
        // For strictness, let's query users who have orders with this vendor.

        const vendorCustomerIds = await prisma.rentalOrder.findMany({
            where: {
                items: {
                    some: {
                        product: {
                            vendorId: session.user.id
                        }
                    }
                }
            },
            select: {
                customerId: true
            },
            distinct: ['customerId']
        });

        const validIds = vendorCustomerIds.map(o => o.customerId);

        const filteredCustomers = await prisma.user.findMany({
            where: {
                id: { in: validIds },
                OR: [
                    { firstName: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                ]
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                image: true
            }
        });

        return NextResponse.json(filteredCustomers);
    } catch (error) {
        console.error("[VENDOR_CUSTOMERS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
