import { getVendorOrders, getVendorQuotations } from "@/actions/vendor";
import { VendorOrderList, UnifiedOrderItem } from "@/components/vendor/VendorOrderList";

export const dynamic = "force-dynamic";

export default async function VendorOrdersPage() {
  // 1. Fetch Data in Parallel
  const [ordersResult, quotationsResult] = await Promise.all([
    getVendorOrders({ limit: 100 }), // Fetch larger batch for client-side filtering
    getVendorQuotations({ limit: 100 })
  ]);

  const unifiedOrders: UnifiedOrderItem[] = [];

  // 2. Process Orders
  if (ordersResult.success && ordersResult.data) {
    ordersResult.data.orders
      .filter((order) => order.status !== "DRAFT") // Exclude DRAFT orders (legacy)
      .forEach((order) => {
        unifiedOrders.push({
          ...order,
          isQuotation: false,
        });
      });
  }

  // 3. Process Quotations
  if (quotationsResult.success && quotationsResult.data) {
    quotationsResult.data.quotations
      // DRAFT and SENT quotations are shown. 
      // CONVERTED/CANCELLED might be filtered out or handled differently in original logic?
      // Original logic: .filter((q) => q.status === "DRAFT" || q.status === "SENT")
      .filter((q) => q.status === "DRAFT" || q.status === "SENT")
      .forEach((quotation) => {
        unifiedOrders.push({
          id: quotation.id,
          orderNumber: quotation.quotationNumber,
          status: "QUOTATION", // Unified View Status
          totalAmount: quotation.totalAmount,
          createdAt: quotation.createdAt,
          customer: quotation.customer,
          items: quotation.items,
          address: quotation.address,
          isQuotation: true,
          quotationStatus: quotation.status,
          validUntil: quotation.validUntil,
        });
      });
  }

  // 4. Sort by Date Descending
  unifiedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <VendorOrderList initialOrders={unifiedOrders} />
  );
}
