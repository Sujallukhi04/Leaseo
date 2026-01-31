"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/actions/vendor/order";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

interface VendorOrderActionsProps {
    orderId: string;
    currentStatus: string;
}

export const VendorOrderActions = ({ orderId, currentStatus }: VendorOrderActionsProps) => {
    const [isPending, startTransition] = useTransition();

    const handleAction = (status: "CONFIRMED" | "CANCELLED") => {
        startTransition(async () => {
            const res = await updateOrderStatus(orderId, status);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(res.success);
            }
        });
    };

    if (currentStatus !== "DRAFT" && currentStatus !== "PENDING") {
        return null;
    }

    return (
        <div className="flex gap-2">
            <Button
                size="sm"
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleAction("CONFIRMED")}
                disabled={isPending}
            >
                <Check className="h-4 w-4 mr-1" />
                Confirm
            </Button>
            <Button
                size="sm"
                variant="destructive"
                onClick={() => handleAction("CANCELLED")}
                disabled={isPending}
            >
                <X className="h-4 w-4 mr-1" />
                Decline
            </Button>
        </div>
    );
};
