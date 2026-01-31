"use client";
import { updateOrderStatus } from "@/actions/vendor/orders";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const OrderActionButtons = ({ orderId, currentStatus }: { orderId: string, currentStatus: string }) => {
  const handleUpdate = async (newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    toast.success(`Order updated to ${newStatus}`);
    window.location.reload();
  };

  return (
    <div className="flex gap-2">
      {currentStatus === "CONFIRMED" && (
        <Button onClick={() => handleUpdate("IN_PROGRESS")}>Mark as Picked Up</Button>
      )}
      {currentStatus === "IN_PROGRESS" && (
        <Button variant="outline" onClick={() => handleUpdate("COMPLETED")}>Process Return</Button>
      )}
    </div>
  );
};