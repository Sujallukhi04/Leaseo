import { getVendorProducts, getCategories, VendorProduct } from "@/actions/vendor";
import { VendorProductList } from "@/components/vendor/VendorProductList";

export const dynamic = "force-dynamic";

export default async function VendorProductsPage() {
  // 1. Fetch Products (Initial Load - no filters)
  const productsResult = await getVendorProducts({ limit: 100 }); // Fetch more initially or implement server-pagination later if needed

  // 2. Fetch Categories (for filter)
  const categoriesResult = await getCategories();

  const products: VendorProduct[] = productsResult.success && productsResult.data
    ? productsResult.data.products
    : [];

  const categories = categoriesResult.success && categoriesResult.data
    ? categoriesResult.data
    : [];

  return (
    <VendorProductList
      initialProducts={products}
      categories={categories}
    />
  );
}
