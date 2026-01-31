"use server";
import { db } from "@/lib/db";
import { currentUser } from "@/hook/use-current-user";

export const createVendorProduct = async (data: any): Promise<any> => {
  const user = await currentUser();
  if (!user || user.role !== "VENDOR") return { error: "Not a vendor" };

  return await db.product.create({
    data: {
      ...data,
      vendorId: user.id, // Links product to the specific vendor
      slug: data.name.toLowerCase().replace(/ /g, "-"),
    },
  });
};

export const getVendorProducts = async (): Promise<any> => {
  const user = await currentUser();
  return await db.product.findMany({
    where: { vendorId: user?.id },
    include: { category: true, inventory: true },
  });
};