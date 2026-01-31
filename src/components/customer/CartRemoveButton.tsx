"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { removeFromCart } from "@/actions/customer/cart";
import { toast } from "sonner";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export const CartRemoveButton = ({ cartItemId }: { cartItemId: string }) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleRemove = () => {
        startTransition(async () => {
            const res = await removeFromCart(cartItemId);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Item removed");
                router.refresh();
            }
        });
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2"
            onClick={handleRemove}
            disabled={isPending}
        >
            <Trash2 className="w-4 h-4 mr-1" />
            {isPending ? "Removing..." : "Remove"}
        </Button>
    );
};
