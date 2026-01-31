"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Settings, 
  Search, 
  LayoutGrid, 
  List, 
  ChevronLeft, 
  ChevronRight,
  User,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCustomers } from "@/actions/vendor/customer-actions";
import { toast } from "sonner";

export default function CustomersPage() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      const result = await getCustomers();
      if (result.error) {
        toast.error(result.error);
      } else if (result.customers) {
        setCustomers(result.customers);
      }
      setIsLoading(false);
    };

    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Customers</h1>
          <Button variant="ghost" size="icon" className="text-zinc-400">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="Searchbar..." 
              className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
            />
          </div>
          
          <div className="flex items-center border border-zinc-800 rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-none h-9 w-9",
                view === "kanban" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:bg-zinc-900"
              )}
              onClick={() => setView("kanban")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-none h-9 w-9 border-l border-zinc-800",
                view === "list" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:bg-zinc-900"
              )}
              onClick={() => setView("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center border border-zinc-800 rounded-md overflow-hidden">
            <Button variant="ghost" size="icon" className="rounded-none h-9 w-9 text-zinc-500 hover:bg-zinc-900">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-none h-9 w-9 border-l border-zinc-800 text-zinc-500 hover:bg-zinc-900">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center text-zinc-500">
          No customers found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <div 
              key={customer.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer group"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-zinc-800 rounded-sm flex items-center justify-center text-zinc-600 group-hover:bg-zinc-700 transition-colors">
                  {customer.image ? (
                    <img src={customer.image} alt={customer.firstName} className="w-full h-full object-cover rounded-sm" />
                  ) : (
                    <User className="w-12 h-12" />
                  )}
                </div>
                <div className="flex flex-col justify-center gap-1">
                  <h3 className="font-bold text-lg">{customer.firstName} {customer.lastName}</h3>
                  <p className="text-zinc-400 text-sm">{customer.email}</p>
                  <p className="text-zinc-500 text-xs">{customer.phone || "No phone"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
