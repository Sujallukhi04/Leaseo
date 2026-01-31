import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Assuming auth is set up
import { db as prisma } from "@/lib/db";
import { z } from "zod";

const productSchema = z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    isRentable: z.boolean().default(true),
    type: z.enum(["GOODS", "SERVICE"]),
    costPrice: z.number().min(0),
    basePrice: z.number().min(0),
    quantity: z.number().min(0),
    categoryId: z.string().optional(),
    isPublished: z.boolean().default(false),
    images: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "VENDOR") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const validatedData = productSchema.parse(body);

        // 1. Handle Category: Find by ID, or Slug, or Create
        let finalCategoryId = validatedData.categoryId;
        if (finalCategoryId) {
            const categoryExists = await prisma.category.findUnique({
                where: { id: finalCategoryId }
            });

            if (!categoryExists) {
                // Try finding by slug
                let categoryBySlug = await prisma.category.findUnique({
                    where: { slug: finalCategoryId.toLowerCase() }
                });

                if (!categoryBySlug) {
                    // Create new category
                    console.log(`[PRODUCT_CREATE] Creating new category: ${finalCategoryId}`);
                    categoryBySlug = await prisma.category.create({
                        data: {
                            name: finalCategoryId.charAt(0).toUpperCase() + finalCategoryId.slice(1),
                            slug: finalCategoryId.toLowerCase(),
                        }
                    });
                }
                finalCategoryId = categoryBySlug.id;
            }
        }

        // 2. Generate Product Slug
        let productSlug = validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        // Ensure uniqueness (simple append timestamp if needed, or check)
        const existingSlug = await prisma.product.findUnique({ where: { slug: productSlug } });
        if (existingSlug) {
            productSlug = `${productSlug}-${Date.now()}`;
        }

        const product = await prisma.product.create({
            data: {
                vendorId: session.user.id,
                name: validatedData.name,
                slug: productSlug,
                sku: validatedData.sku,
                isRentable: validatedData.isRentable,
                type: validatedData.type,
                costPrice: validatedData.costPrice,
                basePrice: validatedData.basePrice,
                quantity: validatedData.quantity,
                categoryId: finalCategoryId,
                isPublished: validatedData.isPublished,
                images: {
                    create: validatedData.images?.map((url) => ({
                        url,
                    })),
                },
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("[PRODUCTS_POST]", error);
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid data", { status: 400 });
        }
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "VENDOR") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query") || "";

        const products = await prisma.product.findMany({
            where: {
                vendorId: session.user.id,
                name: {
                    contains: query,
                    mode: "insensitive",
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("[PRODUCTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
