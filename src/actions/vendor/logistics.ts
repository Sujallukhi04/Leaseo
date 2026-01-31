"use server";
import { db } from "@/lib/db";
import { PickupStatus, ReturnStatus, StockLocation } from "@prisma/client";

export const confirmPickup = async (pickupId: string) => {
  const pickup = await db.pickup.update({
    where: { id: pickupId },
    data: {
      status: PickupStatus.PICKED_UP,
      actualPickupDate: new Date(),
    },
    include: { order: { include: { items: true } } }
  });

  // Update Inventory location to 'WITH_CUSTOMER'
  for (const item of pickup.order.items) {
    await db.inventory.updateMany({
      where: { productId: item.productId, variantId: item.variantId },
      data: { location: StockLocation.WITH_CUSTOMER }
    });
  }
  return { success: "Pickup confirmed and inventory updated" };
};

export const processReturn = async (values: {
  returnId: string;
  condition: string;
  damageFee: number;
  lateFee: number;
}) => {
  const returnRecord = await db.return.update({
    where: { id: values.returnId },
    data: {
      status: ReturnStatus.COMPLETED,
      actualReturnDate: new Date(),
      condition: values.condition,
      damageFee: values.damageFee,
      lateFee: values.lateFee,
    },
    include: { order: { include: { items: true } } }
  });

  // Return items back to 'IN_WAREHOUSE'
  for (const item of returnRecord.order.items) {
    await db.inventory.updateMany({
      where: { productId: item.productId, variantId: item.variantId },
      data: { location: StockLocation.IN_WAREHOUSE }
    });
  }
  return { success: "Return processed and stock restored" };
};