"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const addAddress = async (userId: string, data: any) => {
    try {
        if (!userId) return { error: "Authorized user required" };

        // If setting as default, unset others
        if (data.isDefault) {
            await db.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }

        await db.address.create({
            data: {
                userId,
                fullName: data.fullName,
                label: data.label,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2,
                city: data.city,
                state: data.state,
                postalCode: data.postalCode,
                deliveryInstructions: data.deliveryInstructions,
                isDefault: data.isDefault,
            },
        });

        revalidatePath("/customer/addresses");
        return { success: "Address added successfully" };
    } catch (error) {
        console.error("Add address error:", error);
        return { error: "Failed to add address" };
    }
};

export const updateAddress = async (userId: string, addressId: string, data: any) => {
    try {
        if (!userId) return { error: "Authorized user required" };

        if (data.isDefault) {
            await db.address.updateMany({
                where: { userId, NOT: { id: addressId } },
                data: { isDefault: false },
            });
        }

        await db.address.update({
            where: { id: addressId, userId },
            data: {
                fullName: data.fullName,
                label: data.label,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2,
                city: data.city,
                state: data.state,
                postalCode: data.postalCode,
                deliveryInstructions: data.deliveryInstructions,
                isDefault: data.isDefault,
            },
        });

        revalidatePath("/customer/addresses");
        return { success: "Address updated successfully" };
    } catch (error) {
        console.error("Update address error:", error);
        return { error: "Failed to update address" };
    }
};

export const deleteAddress = async (userId: string, addressId: string) => {
    try {
        if (!userId) return { error: "Authorized user required" };

        await db.address.delete({
            where: { id: addressId, userId },
        });

        revalidatePath("/customer/addresses");
        return { success: "Address deleted successfully" };
    } catch (error) {
        console.error("Delete address error:", error);
        return { error: "Failed to delete address" };
    }
};

export const getAddresses = async (userId: string) => {
    try {
        if (!userId) return [];

        return await db.address.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        return [];
    }
}
