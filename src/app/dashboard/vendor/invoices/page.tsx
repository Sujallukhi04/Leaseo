import { db } from "@/lib/db";
import { currentUser } from "@/hook/use-current-user";
import { Button } from "@/components/ui/button";

export default async function VendorInvoicesPage() {
  const user = await currentUser();
  const invoices = await db.invoice.findMany({
    where: { order: { items: { some: { product: { vendorId: user?.id } } } } },
    include: { customer: true, order: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing & Invoices</h1>
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Invoice #</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono">{inv.invoiceNumber}</td>
                <td className="p-4">{inv.customer.firstName} {inv.customer.lastName}</td>
                <td className="p-4 font-bold">₹{inv.totalAmount.toString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="p-4 text-gray-500">{inv.dueDate.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}