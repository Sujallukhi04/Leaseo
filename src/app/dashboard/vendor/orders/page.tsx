"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { getVendorOrders } from "@/actions/vendor/order-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      const result = await getVendorOrders();
      if (result.error) {
        toast.error(result.error);
      } else if (result.orders) {
        setOrders(result.orders);
      }
      setIsLoading(false);
    };

    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Link href="/dashboard/vendor/orders/new">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center text-zinc-500">
          No orders found.
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-zinc-800 text-zinc-400 text-sm">
                <th className="px-6 py-4 font-medium">Order Number</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Total</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300 divide-y divide-zinc-800/50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-800/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 font-bold text-white">{order.orderNumber}</td>
                  <td className="px-6 py-4">
                    {order.customer.firstName} {order.customer.lastName}
                    <div className="text-xs text-zinc-500">{order.customer.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                      order.status === "CONFIRMED" ? "bg-green-500/10 text-green-500" :
                      order.status === "DRAFT" ? "bg-zinc-500/10 text-zinc-500" : "bg-blue-500/10 text-blue-500"
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-white">Rs {order.totalAmount.toString()}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
