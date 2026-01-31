"use server";
import { db } from "@/lib/db";
import { currentUser } from "@/hook/use-current-user";

export const getVendorAnalytics = async (): Promise<any> => {
  const user = await currentUser();
  if (!user || user.role !== "VENDOR") return { error: "Unauthorized" };

  const vendorProfile = await db.vendorProfile.findUnique({
    where: { userId: user.id }
  });

  const orders = await db.rentalOrderItem.findMany({
    where: { product: { vendorId: user.id } },
    include: { order: true }
  });

  const totalRevenue = orders.reduce((acc, item) => acc + Number(item.totalPrice), 0);
  const platformCommission = (totalRevenue * (vendorProfile?.commissionRate || 10)) / 100;
  const netEarnings = totalRevenue - platformCommission;

  // Aggregate most rented products
  const productStats = await db.rentalOrderItem.groupBy({
    by: ['productId'],
    where: { product: { vendorId: user.id } },
    _count: { id: true },
    _sum: { totalPrice: true }
  });

  return {
    totalRevenue,
    platformCommission,
    netEarnings,
    productStats
  };
};