import { db } from "@/lib/db";
import { currentUser } from "@/hook/use-current-user";
import { OrderActionButtons } from "@/components/vendor/order-actions";

export default async function VendorLogisticsPage() {
  const user = await currentUser();
  const orders = await db.rentalOrder.findMany({
    where: { items: { some: { product: { vendorId: user?.id } } } },
    include: { pickup: true, return: true, customer: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pickups & Returns</h1>
      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="p-4 bg-white border rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold">Order #{order.orderNumber}</p>
              <p className="text-sm text-gray-500">Customer: {order.customer.firstName} {order.customer.lastName}</p>
              <p className="text-xs uppercase font-bold mt-1">
                Pickup: <span className="text-blue-600">{order.pickup?.status}</span> | 
                Return: <span className="text-orange-600">{order.return?.status}</span>
              </p>
            </div>
            <OrderActionButtons orderId={order.id} currentStatus={order.status} />
          </div>
        ))}
      </div>
    </div>
  );
}