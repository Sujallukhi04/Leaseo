"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Check, 
  X, 
  Send,
  Printer,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { getOrderForInvoice, createInvoiceFromOrder } from "@/actions/vendor/invoice-actions";
import { toast } from "sonner";

type InvoiceStatus = "draft" | "posted";

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [isPending, startTransition] = useTransition();
  
  const [status, setStatus] = useState<InvoiceStatus>("draft");
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      toast.error("No order ID provided");
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      const res = await getOrderForInvoice(orderId);
      if (res.error) {
        toast.error(res.error);
      } else {
        setOrder(res.order);
      }
      setIsLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  const handleCreateInvoice = () => {
    if (!orderId) return;

    startTransition(async () => {
      const res = await createInvoiceFromOrder(orderId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Invoice created successfully");
        router.push("/dashboard/vendor/invoices");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12 text-zinc-500">
        Order not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vendor/invoices">
            <Button variant="outline" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white border-none">
              New
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Invoice</h1>
          <div className="flex items-center gap-2 ml-4">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 border border-green-500 rounded-sm">
              <Check className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 border border-red-500 rounded-sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        {/* Status Bar & Actions */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-purple-600 hover:bg-purple-700 text-white border-none h-8"
              onClick={handleCreateInvoice}
              disabled={isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {isPending ? "Creating..." : "Confirm & Send"}
            </Button>
            <Button variant="outline" size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700 h-8">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>

          <div className="flex items-center">
            <div className={cn(
              "px-8 py-1 text-sm font-bold rounded-l-md border border-zinc-700 transition-colors",
              status === "draft" ? "bg-zinc-200 text-black border-zinc-200" : "bg-zinc-900 text-zinc-500"
            )}>
              Draft
            </div>
            <div className={cn(
              "px-8 py-1 text-sm font-bold rounded-r-md border border-zinc-700 transition-colors",
              status === "posted" ? "bg-zinc-200 text-black border-zinc-200" : "bg-zinc-900 text-zinc-500"
            )}>
              Posted
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="text-3xl font-bold text-zinc-300">INV/{new Date().getFullYear()}/{Math.floor(Math.random() * 9000) + 1000}</div>

          <div className="grid grid-cols-2 gap-x-20 gap-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-8">
                <Label className="w-32 text-zinc-400 font-normal">Customer</Label>
                <div className="flex-1 text-white border-b border-zinc-800 py-2">
                  {order.customer.firstName} {order.customer.lastName}
                </div>
              </div>
              <div className="flex items-center gap-8">
                <Label className="w-32 text-zinc-400 font-normal">Invoice Address</Label>
                <div className="flex-1 text-white border-b border-zinc-800 py-2">
                  {order.customer.email}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-8">
                <Label className="w-32 text-zinc-400 font-normal">Invoice date</Label>
                <div className="flex-1 text-white border-b border-zinc-800 py-2">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-8">
                <Label className="w-32 text-zinc-400 font-normal">Due Date</Label>
                <div className="flex-1 text-white border-b border-zinc-800 py-2">
                  {new Date(Date.now() + 7 * 86400000).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-12">
            <div className="border-b border-purple-600 w-fit px-4 py-2 text-sm font-medium">
              Invoice Lines
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-zinc-800 text-zinc-300 text-sm">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Quantity</th>
                  <th className="pb-2 font-medium">Unit</th>
                  <th className="pb-2 font-medium">Unit Price</th>
                  <th className="pb-2 font-medium">Taxes</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400 text-sm">
                {order.items.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-zinc-800/50">
                    <td className="py-4">
                      <div className="font-medium text-white">{item.product.name}</div>
                      <div className="text-[10px] text-zinc-500">
                        [{new Date(item.rentalStartDate).toLocaleDateString()} → {new Date(item.rentalEndDate).toLocaleDateString()}]
                      </div>
                    </td>
                    <td className="py-4">{item.quantity}</td>
                    <td className="py-4">Units</td>
                    <td className="py-4 text-white">Rs {item.unitPrice.toLocaleString()}</td>
                    <td className="py-4">---</td>
                    <td className="py-4 text-right text-white font-medium">Rs {item.totalPrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-start mt-12">
            <div className="space-y-4">
               <div className="flex items-center gap-2 mt-8">
                 <span className="text-sm text-zinc-400">Terms & Conditions:</span>
                 <Link href="#" className="text-sm text-blue-500 hover:underline">https://xxxxx.xxx.xxx/terms</Link>
               </div>
            </div>

            <div className="w-64 space-y-2 border-t border-zinc-800 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Untaxed Amount:</span>
                <span className="text-zinc-300">Rs {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-white">Total:</span>
                <span className="text-white">Rs {order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
