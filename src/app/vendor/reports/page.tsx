import { getVendorOrders } from "@/actions/vendor";
import { VendorReportsClient } from "@/components/vendor/VendorReportsClient";

export const dynamic = "force-dynamic";

export default async function VendorReportsPage() {
  // Fetch a large batch of orders to calculate stats and charts client-side
  // This reduces server load on calculation and is suitable for moderate datasets.
  const result = await getVendorOrders({ limit: 1000 });
  const orders = result.success && result.data ? result.data.orders : [];

  return <VendorReportsClient orders={orders} />;
}
