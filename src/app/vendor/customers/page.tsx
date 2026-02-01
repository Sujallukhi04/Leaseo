import { getVendorCustomers } from "@/actions/vendor";
import { VendorCustomerList } from "@/components/vendor/VendorCustomerList";

export const dynamic = "force-dynamic";

export default async function VendorCustomersPage() {
  const result = await getVendorCustomers({ limit: 100 });
  const customers = result.success && result.data ? result.data.customers : [];

  return <VendorCustomerList initialCustomers={customers} />;
}
