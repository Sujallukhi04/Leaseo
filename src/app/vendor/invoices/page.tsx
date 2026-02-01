import { getVendorInvoices } from "@/actions/vendor";
import { VendorInvoiceList } from "@/components/vendor/VendorInvoiceList";

export const dynamic = "force-dynamic";

export default async function VendorInvoicesPage() {
  const result = await getVendorInvoices({ limit: 100 });
  const invoices = result.success && result.data ? result.data.invoices : [];

  return <VendorInvoiceList initialInvoices={invoices} />;
}
