"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export const changePassword = async (
    data: {
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
    }
) => {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const { currentPassword, newPassword, confirmPassword } = data;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return { error: "Missing fields" };
        }

        if (newPassword !== confirmPassword) {
            return { error: "New passwords do not match" };
        }

        if (newPassword.length < 6) {
            return { error: "Password must be at least 6 characters" };
        }

        const user = await db.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user || !user.password) {
            return { error: "User not found or uses social login" };
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);

        if (!passwordMatch) {
            return { error: "Incorrect current password" };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        return { success: "Password updated successfully" };

    } catch (error) {
        console.error("Change password error:", error);
        return { error: "Failed to update password" };
    }
};
