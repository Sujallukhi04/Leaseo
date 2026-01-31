import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getCategories } from "@/actions/vendor/product-actions";
import { ProductForm } from "@/components/vendor/product-form";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

export default async function ProductPage({
    params
}: {
    params: Promise<{ productId: string }>
}) {
    const resolvedParams = await params;
    const productId = resolvedParams.productId;

    const session = await auth();

    if (!session?.user || session.user.role !== UserRole.VENDOR) {
        redirect("/auth/login");
    }

    // Fetch categories for the form
    const { categories } = await getCategories();

    // Fetch existing product
    const product = await db.product.findUnique({
        where: {
            id: productId,
            vendorId: session.user.id
        },
        include: {
            images: true,
            variants: true
        }
    });

    if (!product) {
        redirect("/vendor/products");
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
            </div>
            <div className="h-full w-full">
                <ProductForm
                    categories={Array.isArray(categories) ? categories : []}
                    initialData={product ? {
                        ...product,
                        basePrice: Number(product.basePrice),
                        costPrice: Number(product.costPrice),
                        securityDeposit: Number(product.securityDeposit),
                        priceModifier: product.variants?.[0]?.priceModifier ? Number(product.variants[0].priceModifier) : 0,
                        createdAt: product.createdAt.toISOString(),
                        updatedAt: product.updatedAt.toISOString(),
                        images: product.images.map(img => ({
                            ...img,
                            createdAt: img.createdAt.toISOString()
                        }))
                    } : undefined}
                />
            </div>
        </div>
    );
}
