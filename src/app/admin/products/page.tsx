import { getAdminProducts } from "@/actions/admin";
import { ProductList } from "@/components/admin/ProductList";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
    const { success, data, error } = await getAdminProducts();

    if (!success) {
        return (
            <div className="flex h-full items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
                <div className="text-center p-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-semibold text-red-600 mb-2">Error loading products</h2>
                    <p className="text-slate-500 dark:text-slate-400">{error}</p>
                </div>
            </div>
        );
    }

    return <ProductList products={data || []} />;
}
