"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Check, 
  X, 
  Image as ImageIcon,
  Trash2,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCurrentUserClient } from "@/hook/use-current-user";
import { createProduct } from "@/actions/vendor/product-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Tab = "general" | "attributes";

export default function NewProductPage() {
  const { user } = useCurrentUserClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<Tab>("general");
  
  const [formData, setFormData] = useState({
    name: "",
    productType: "goods",
    quantity: "100",
    salesPrice: "",
    costPrice: "",
    category: "",
    isPublished: false,
    description: ""
  });

  const onSubmit = () => {
    if (!formData.name) {
      toast.error("Product name is required");
      return;
    }

    startTransition(async () => {
      const result = await createProduct({
        ...formData,
        salesPrice: parseFloat(formData.salesPrice) || 0,
        costPrice: parseFloat(formData.costPrice) || 0,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        router.push("/dashboard/vendor/products");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vendor/products">
            <Button variant="outline" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white border-none">
              New
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Product</h1>
          <div className="flex items-center gap-2 ml-4">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-green-500 border border-green-500 rounded-sm"
              onClick={onSubmit}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </Button>
            <Link href="/dashboard/vendor/products">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 border border-red-500 rounded-sm">
                <X className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex justify-between items-start">
            <div className="flex-1 max-w-2xl">
              <Label className="text-zinc-500 text-xs mb-1 block">Product</Label>
              <Input 
                placeholder="Product Name" 
                className="bg-transparent border-none border-b border-zinc-700 rounded-none px-0 text-2xl font-bold focus-visible:ring-0 placeholder:text-zinc-700"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="w-32 h-32 border-2 border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-600 hover:text-zinc-400 hover:border-zinc-600 cursor-pointer transition-colors">
              <ImageIcon className="w-8 h-8 mb-2" />
              <span className="text-[10px] font-medium">ADD IMAGE</span>
            </div>
          </div>
        </div>

        <div className="px-6 border-b border-zinc-800">
          <div className="flex">
            <button
              onClick={() => setActiveTab("general")}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === "general" 
                  ? "border-purple-600 text-purple-600" 
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
            >
              General Information
            </button>
            <button
              onClick={() => setActiveTab("attributes")}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === "attributes" 
                  ? "border-purple-600 text-purple-600" 
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
            >
              Attributes & Variants
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "general" ? (
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <div className="space-y-6">
                <div className="flex items-center gap-8">
                  <Label className="w-32 text-zinc-400 font-normal">Product Type</Label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center",
                        formData.productType === "goods" ? "border-green-500" : "border-zinc-600"
                      )}>
                        {formData.productType === "goods" && <div className="w-2 h-2 rounded-full bg-green-500" />}
                      </div>
                      <input 
                        type="radio" 
                        className="hidden" 
                        name="productType" 
                        checked={formData.productType === "goods"}
                        onChange={() => setFormData({...formData, productType: "goods"})}
                      />
                      <span className="text-sm">Goods</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center",
                        formData.productType === "service" ? "border-green-500" : "border-zinc-600"
                      )}>
                        {formData.productType === "service" && <div className="w-2 h-2 rounded-full bg-green-500" />}
                      </div>
                      <input 
                        type="radio" 
                        className="hidden" 
                        name="productType" 
                        checked={formData.productType === "service"}
                        onChange={() => setFormData({...formData, productType: "service"})}
                      />
                      <span className="text-sm">Service</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <Label className="w-32 text-zinc-400 font-normal">Quantity on Hand</Label>
                  <Input 
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="flex-1 bg-transparent border-none border-b border-zinc-700 rounded-none px-0 focus-visible:ring-0"
                  />
                </div>

                <div className="flex items-center gap-8">
                  <Label className="w-32 text-zinc-400 font-normal">Sales Price</Label>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-zinc-500">$</span>
                    <Input 
                      type="number"
                      value={formData.salesPrice}
                      onChange={(e) => setFormData({...formData, salesPrice: e.target.value})}
                      className="flex-1 bg-transparent border-none border-b border-zinc-700 rounded-none px-0 focus-visible:ring-0"
                    />
                    <span className="text-zinc-500 text-sm whitespace-nowrap">Per Units</span>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <Label className="w-32 text-zinc-400 font-normal">Cost Price</Label>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-zinc-500">$</span>
                    <Input 
                      type="number"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                      className="flex-1 bg-transparent border-none border-b border-zinc-700 rounded-none px-0 focus-visible:ring-0"
                    />
                    <span className="text-zinc-500 text-sm whitespace-nowrap">Per Units</span>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <Label className="w-32 text-zinc-400 font-normal">Category</Label>
                  <Input 
                    placeholder="Furniture/ Electronics"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="flex-1 bg-transparent border-none border-b border-zinc-700 rounded-none px-0 focus-visible:ring-0 placeholder:text-zinc-600"
                  />
                </div>

                <div className="flex items-center gap-8">
                  <Label className="w-32 text-zinc-400 font-normal">Vendor Name:</Label>
                  <Input 
                    value={user?.name || ""}
                    readOnly
                    className="flex-1 bg-transparent border-none border-b border-zinc-700 rounded-none px-0 focus-visible:ring-0 text-zinc-500"
                  />
                </div>
              </div>

              <div className="space-y-6 flex flex-col items-end">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Publish</span>
                  <button 
                    onClick={() => setFormData({...formData, isPublished: !formData.isPublished})}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      formData.isPublished ? "bg-blue-500" : "bg-zinc-700"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      formData.isPublished ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 text-right max-w-[150px]">
                  Only Admin should have the right to publish or unpublish a product
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-zinc-800">
                    <th className="pb-4 font-bold text-lg w-1/3">Attributes</th>
                    <th className="pb-4 font-bold text-lg w-1/2">Values</th>
                    <th className="pb-4"></th>
                  </tr>
                </thead>
                <tbody className="text-zinc-400 text-sm">
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-4">Name of the Attributes (Brand, color, Size...)</td>
                    <td className="py-4">List of possible values (e.g. Red, Green, Blue..)</td>
                    <td className="py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white">
                        Configure
                      </Button>
                      <Button variant="ghost" size="icon" className="text-zinc-700 hover:text-red-500 ml-2">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <Button variant="ghost" className="text-blue-500 hover:text-blue-400 hover:bg-transparent p-0 h-auto font-normal text-sm">
                Add a line
              </Button>
            </div>
          )}
        </div>
      </div>

      {activeTab === "general" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mt-6">
          <p className="text-zinc-500 text-sm">
            If the vendor wants to add deposit or downpayment with the product then the vendor needs to create product(type Service) named deposit/downpayment and add it in the invoice. Same goes with the warranty
          </p>
        </div>
      )}
    </div>
  );
}
