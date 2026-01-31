"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getNotifications = async () => {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Not authenticated" };
    }

    try {
        const notifications = await db.notification.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 20, // Limit to last 20
        });

        return { notifications };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { error: "Failed to fetch notifications" };
    }
};

export const markNotificationAsRead = async (notificationId: string) => {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Not authenticated" };
    }

    try {
        // Verify ownership
        const notification = await db.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification || notification.userId !== session.user.id) {
            return { error: "Notification not found or access denied" };
        }

        await db.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });

        return { success: true };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return { error: "Failed to update notification" };
    }
};

export const markAllNotificationsAsRead = async () => {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Not authenticated" };
    }

    try {
        await db.notification.updateMany({
            where: {
                userId: session.user.id,
                isRead: false
            },
            data: { isRead: true },
        });

        return { success: true };
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return { error: "Failed to mark all as read" };
    }
};
