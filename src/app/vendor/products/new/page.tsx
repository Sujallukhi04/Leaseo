import { getCategories } from "@/actions/vendor/product-actions";
import { ProductForm } from "@/components/vendor/product-form";
import { Category } from "@prisma/client";

export default async function NewProductPage() {
    const { categories } = await getCategories();

    // Handle error case if needed, though getCategories returns { categories: [] } or error object.
    // We need to ensure categories is an array.

    const validCategories = Array.isArray(categories) ? categories : [];

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Add Product</h2>
            </div>
            <div className="h-full w-full">
                <ProductForm categories={validCategories as Category[]} />
            </div>
        </div>
    );
}
