"use server";
import { db } from "@/lib/db";
import { currentUser } from "@/hook/use-current-user";

export const getVendorReportData = async (startDate: Date, endDate: Date) => {
  const user = await currentUser();
  if (!user || user.role !== "VENDOR") return { error: "Unauthorized" };

  return await db.rentalOrderItem.findMany({
    where: {
      product: { vendorId: user.id },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      product: true,
      order: {
        include: { customer: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};