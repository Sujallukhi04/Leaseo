"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const updateProfile = async (
    userId: string,
    data: {
        firstName: string;
        lastName: string;
        email: string; // usually email change requires verification, but we'll allow basic update or just keep it helper
        phone?: string;
        image?: string;
    }
) => {
    try {
        // Basic validation
        if (!userId) {
            return { error: "User ID is missing" };
        }

        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            return { error: "User not found" };
        }

        // Update
        await db.user.update({
            where: { id: userId },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                image: data.image,
            },
        });

        revalidatePath("/customer/profile");
        return { success: "Profile updated successfully" };
    } catch (error) {
        console.error("Profile update error:", error);
        return { error: "Failed to update profile" };
    }
};
