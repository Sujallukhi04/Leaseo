"use server";
import { db } from "@/lib/db";
import { currentUser } from "@/hook/use-current-user";

export const getVendorOrders = async () => {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized" };

  // This query finds orders that contain items belonging to this vendor
  return await db.rentalOrder.findMany({
    where: {
      items: {
        some: {
          product: { vendorId: user.id }
        }
      }
    },
    include: {
      customer: true,
      items: {
        include: { product: true }
      },
      pickup: true,
      return: true,
    },
    orderBy: { createdAt: "desc" }
  });
};

export const updateOrderStatus = async (orderId: string, status: any) => {
  return await db.rentalOrder.update({
    where: { id: orderId },
    data: { status }
  });
};