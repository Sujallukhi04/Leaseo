import { db } from "@/lib/db";

export const getAllProducts = async ({
    minPrice,
    maxPrice
}: {
    minPrice?: number;
    maxPrice?: number;
} = {}) => {
    try {
        const whereClause: any = {
            isPublished: true,
        };

        if (minPrice !== undefined || maxPrice !== undefined) {
            const priceFilter: any = {};
            if (minPrice !== undefined) priceFilter.gte = minPrice;
            if (maxPrice !== undefined) priceFilter.lte = maxPrice;

            whereClause.OR = [
                { basePrice: priceFilter },
                { rentalPricing: { some: { price: priceFilter } } }
            ];
        }

        const products = await db.product.findMany({
            where: whereClause,
            include: {
                images: true,
                rentalPricing: true,
                vendor: {
                    select: {
                        companyName: true,
                        firstName: true,
                        lastName: true,
                    }
                },
                category: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
};

export const getProductById = async (id: string) => {
    try {
        const product = await db.product.findUnique({
            where: {
                id,
            },
            include: {
                images: true,
                rentalPricing: true,
                category: true,
                vendor: {
                    select: {
                        companyName: true,
                        firstName: true,
                        lastName: true,
                    }
                }
            },
        });

        return product;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
};
