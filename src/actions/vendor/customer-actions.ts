"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

export async function getCustomers() {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.VENDOR) {
    return { error: "Unauthorized" };
  }

  try {
    const customers = await db.user.findMany({
      where: {
        role: UserRole.CUSTOMER,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
      },
      orderBy: {
        firstName: "asc",
      },
    });

    return { customers };
  } catch (error) {
    return { error: "Failed to fetch customers" };
  }
}
