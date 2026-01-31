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
  FilePlus,
  Plus,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getCustomers } from "@/actions/vendor/customer-actions";
import { getVendorProducts } from "@/actions/vendor/product-actions";
import { createRentalOrder, checkProductAvailability } from "@/actions/vendor/order-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OrderStatus = "quotation" | "sent" | "confirmed";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  rentalStartDate: string;
  rentalEndDate: string;
  periodType: "DAILY" | "HOURLY" | "WEEKLY";
  periodDuration: number;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<OrderStatus>("quotation");
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [availabilities, setAvailabilities] = useState<(number | null)[]>([]);
  
  const [invoiceAddress, setInvoiceAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const custRes = await getCustomers();
      if (custRes.customers) setCustomers(custRes.customers);
      
      const prodRes = await getVendorProducts();
      if (prodRes.products) setProducts(prodRes.products);
    };
    fetchData();
  }, []);

  // Re-check availability per line when product/dates change
  useEffect(() => {
    if (items.length === 0) return;

    items.forEach(async (item, index) => {
      if (!item.productId) {
        setAvailabilities(prev => {
          const next = [...prev];
          next[index] = null;
          return next;
        });
        return;
      }

      try {
        const res = await checkProductAvailability({
          productId: item.productId,
          variantId: null,
          rentalStartDate: item.rentalStartDate,
          rentalEndDate: item.rentalEndDate
        });

        setAvailabilities(prev => {
          const next = [...prev];
          next[index] = res.available ?? null;
          return next;
        });
      } catch (err) {
        setAvailabilities(prev => {
          const next = [...prev];
          next[index] = null;
          return next;
        });
      }
    });
  }, [items]);

  const addItem = () => {
    setItems([...items, {
      productId: "",
      name: "",
      quantity: 1,
      unit: "Units",
      unitPrice: 0,
      rentalStartDate: new Date().toISOString().split('T')[0],
      rentalEndDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      periodType: "DAILY",
      periodDuration: 1
    }]);
    setAvailabilities(prev => [...prev, null]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    setAvailabilities(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    if (field === "productId") {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        item.name = selectedProduct.name;
        item.unitPrice = selectedProduct.basePrice || 0;
      }
    }
    
    newItems[index] = item;
    setItems(newItems);

    // Reset availability for this line while we re-check
    setAvailabilities(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };

  const onSubmit = (createAsConfirmed: boolean = false) => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    startTransition(async () => {
      const subtotal = calculateSubtotal();
      const payload: any = {
        customerId: selectedCustomerId,
        subtotal,
        totalAmount: subtotal, // For now keeping it same, no taxes/discounts implemented in logic yet
        items: items.map(item => ({
          ...item,
          totalPrice: item.quantity * item.unitPrice
        })),
        notes: `Invoice Address: ${invoiceAddress}\nDelivery Address: ${deliveryAddress}`
      };

      if (createAsConfirmed) payload.status = "confirmed";

      const res = await createRentalOrder(payload);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(createAsConfirmed ? "Order confirmed and reserved" : "Order created successfully");
        router.push("/dashboard/vendor/orders");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vendor/orders">
            <Button variant="outline" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white border-none">
              New
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Rental order</h1>
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
              onClick={() => onSubmit(false)}
              disabled={isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {isPending ? "Creating..." : "Send"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700 h-8" 
              onClick={() => onSubmit(true)}
              disabled={isPending}
            >
              {isPending ? 'Confirming...' : 'Confirm'}
            </Button>
            <Button variant="outline" size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700 h-8">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            {status === "confirmed" && (
              <Link href="/dashboard/vendor/invoices/new">
                <Button variant="outline" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white border-none h-8 ml-2">
                  Create Invoice
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center">
            <div className={cn(
              "px-4 py-1 text-xs font-bold rounded-l-md border border-zinc-700 transition-colors",
              status === "quotation" ? "bg-zinc-200 text-black border-zinc-200" : "bg-zinc-900 text-zinc-500"
            )}>
              Quotation
            </div>
            <div className={cn(
              "px-4 py-1 text-xs font-bold border-y border-zinc-700 transition-colors",
              status === "sent" ? "bg-zinc-200 text-black border-zinc-200" : "bg-zinc-900 text-zinc-500"
            )}>
              Quotation Sent
            </div>
            <div className={cn(
              "px-4 py-1 text-xs font-bold rounded-r-md border border-zinc-700 transition-colors",
              status === "confirmed" ? "bg-zinc-200 text-black border-zinc-200" : "bg-zinc-900 text-zinc-500"
            )}>
              Sale Order
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="text-3xl font-bold text-zinc-300">S{Math.floor(Math.random() * 90000) + 10000}</div>

          <div className="grid grid-cols-2 gap-x-20 gap-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-8">
                <Label className="w-32 text-zinc-400 font-normal">Customer</Label>
                <div className="flex-1">
                  <Select onValueChange={setSelectedCustomerId} value={selectedCustomerId}>
                    <SelectTrigger className="bg-transparent border-none border-b border-zinc-800 rounded-none px-0 focus:ring-0">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-white hover:bg-zinc-800 focus:bg-zinc-800">
                          {c.firstName} {c.lastName} ({c.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <Label className="w-32 text-zinc-400 font-normal">Invoice Address</Label>
                <Input 
                  value={invoiceAddress}
                  onChange={(e) => setInvoiceAddress(e.target.value)}
                  className="flex-1 bg-transparent border-none border-b border-zinc-800 rounded-none px-0 focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-8">
                <Label className="w-32 text-zinc-400 font-normal">Delivery Address</Label>
                <Input 
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="flex-1 bg-transparent border-none border-b border-zinc-800 rounded-none px-0 focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-8">
                <Label className="w-32 text-zinc-400 font-normal">Order date</Label>
                <Input 
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="flex-1 bg-transparent border-none border-b border-zinc-800 rounded-none px-0 focus-visible:ring-0"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-12">
            <div className="border-b border-purple-600 w-fit px-4 py-2 text-sm font-medium">
              Order Line
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-zinc-800 text-zinc-300 text-sm">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Quantity</th>
                  <th className="pb-2 font-medium">Unit Price</th>
                  <th className="pb-2 font-medium">Rental Period</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                  <th className="pb-2 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody className="text-zinc-400 text-sm">
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-zinc-800/50">
                    <td className="py-4 pr-4">
                      <Select 
                        value={item.productId} 
                        onValueChange={(val) => updateItem(index, "productId", val)}
                      >
                        <SelectTrigger className="bg-transparent border-none focus:ring-0 h-auto p-0 text-white font-medium">
                          <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id} className="text-white hover:bg-zinc-800 focus:bg-zinc-800">
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-4">
                      <Input 
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
                        className="w-20 bg-transparent border-none focus-visible:ring-0 text-white"
                      />
                      <div className="text-[11px] text-zinc-500 mt-1">
                        {typeof availabilities[index] === 'number' ? `Available: ${availabilities[index]}` : 'Availability: -'}
                      </div>
                    </td>
                    <td className="py-4">
                      <Input 
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value))}
                        className="w-24 bg-transparent border-none focus-visible:ring-0 text-white"
                      />
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Input 
                          type="date"
                          value={item.rentalStartDate}
                          onChange={(e) => updateItem(index, "rentalStartDate", e.target.value)}
                          className="bg-transparent border-none focus-visible:ring-0 text-xs w-32"
                        />
                        <span>→</span>
                        <Input 
                          type="date"
                          value={item.rentalEndDate}
                          onChange={(e) => updateItem(index, "rentalEndDate", e.target.value)}
                          className="bg-transparent border-none focus-visible:ring-0 text-xs w-32"
                        />
                      </div>
                    </td>
                    <td className="py-4 text-right text-white font-medium">
                      Rs {(item.quantity * item.unitPrice).toLocaleString()}
                    </td>
                    <td className="py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-zinc-500 hover:text-red-500"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-4 text-blue-500 text-sm">
              <button 
                className="hover:underline flex items-center gap-1"
                onClick={addItem}
              >
                <Plus className="w-3 h-3" />
                Add a Product
              </button>
              <button className="hover:underline">Add a note</button>
            </div>
          </div>

          <div className="flex justify-between items-start mt-12">
            <div className="space-y-4">
               <div className="flex gap-2">
                 <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-800 text-zinc-400 text-[10px] h-7 px-2">Coupon Code</Button>
                 <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-800 text-zinc-400 text-[10px] h-7 px-2">Discount</Button>
                 <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-800 text-zinc-400 text-[10px] h-7 px-2">Add Shipping</Button>
               </div>
               <div className="flex items-center gap-2 mt-8">
                 <span className="text-sm text-zinc-400">Terms & Conditions:</span>
                 <Link href="#" className="text-sm text-blue-500 hover:underline">https://xxxxx.xxx.xxx/terms</Link>
               </div>
            </div>

            <div className="w-64 space-y-2 border-t border-zinc-800 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Untaxed Amount:</span>
                <span className="text-zinc-300">Rs {calculateSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-white">Total:</span>
                <span className="text-white">Rs {calculateSubtotal().toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-zinc-600 text-right mt-4 leading-tight">
                Downpayments, Deposits, Taxes should be taken into consideration while calculating total amount
              </p>
            </div>
          </div>
        </div>
      </div>
      <p className="text-zinc-600 text-xs">There should be a separate page for the standard terms and conditions of renting a product</p>
    </div>
  );
}
