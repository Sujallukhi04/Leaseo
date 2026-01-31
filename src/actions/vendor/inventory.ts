"use server";
import { db } from "@/lib/db";

export const updateStockLocation = async (productId: string, location: "IN_WAREHOUSE" | "WITH_CUSTOMER") => {
  return await db.inventory.updateMany({
    where: { productId },
    data: { location }
  });
};