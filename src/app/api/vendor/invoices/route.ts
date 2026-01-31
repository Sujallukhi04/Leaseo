import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db as prisma } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "VENDOR") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch invoices for orders related to this vendor
        // Since schema links Invoice -> RentalOrder -> Items -> Product -> Vendor
        // This query acts as a filter for 'Invoices where linked order contains products from this vendor'
        const invoices = await prisma.invoice.findMany({
            where: {
                order: {
                    items: {
                        some: {
                            product: {
                                vendorId: session.user.id
                            }
                        }
                    }
                }
            },
            include: {
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(invoices);
    } catch (error) {
        console.error("[INVOICES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
