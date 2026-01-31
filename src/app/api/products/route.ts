import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: {
                isPublished: true,
            },
            include: {
                images: true,
                category: true,
                vendor: {
                    select: {
                        companyName: true,
                        firstName: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("[PUBLIC_PRODUCTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
