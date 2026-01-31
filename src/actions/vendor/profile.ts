"use server";
import { db } from "@/lib/db";
import { currentUser } from "@/hook/use-current-user";

export const updateVendorProfile = async (values: any) => {
  const user = await currentUser();
  if (!user || user.role !== "VENDOR") return { error: "Unauthorized" };

  return await db.vendorProfile.upsert({
    where: { userId: user.id },
    update: { ...values },
    create: { userId: user.id, ...values },
  });
};