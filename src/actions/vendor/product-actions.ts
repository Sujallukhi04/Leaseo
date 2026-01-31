"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getVendorProducts() {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.VENDOR) {
    return { error: "Unauthorized" };
  }

  try {
    const products = await db.product.findMany({
      where: {
        vendorId: session.user.id,
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { products };
  } catch (error) {
    return { error: "Failed to fetch products" };
  }
}


import { ProductSchema } from "@/lib";
import { z } from "zod";

export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
    });
    return { categories };
  } catch (error) {
    return { error: "Failed to fetch categories" };
  }
}

export async function createProduct(data: z.infer<typeof ProductSchema>) {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.VENDOR) {
    return { error: "Unauthorized" };
  }

  const validatedFields = ProductSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const {
    name,
    description,
    basePrice,
    costPrice,
    quantity,
    categoryId,
    images,
    isPublished,
    minRentalPeriod,
    securityDeposit
  } = validatedFields.data;

  try {
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

    // Generate SKU
    const sku = "SKU-" + Date.now();

    const product = await db.product.create({
      data: {
        name,
        slug,
        sku,
        vendorId: session.user.id,
        categoryId,
        basePrice,
        costPrice,
        quantity,
        isPublished,
        isRentable: true,
        description,
        minRentalPeriod,
        securityDeposit,
        images: {
          create: images.map((url, index) => ({
            url,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        }
      },
    });

    revalidatePath("/vendor/products");
    return { success: "Product created" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create product" };
  }
}

export async function deleteProduct(productId: string) {
  const session = await auth();
  console.log(session?.user?.id)

  if (!session?.user || session.user.role !== UserRole.VENDOR) {
    return { error: "Unauthorized" };
  }

  try {
    const product = await db.product.findUnique({
      where: {
        id: productId,
        vendorId: session.user.id, // Ensure only the owner can delete
      },
    });

    if (!product) {
      return { error: "Product not found or unauthorized" };
    }

    // Delete related records that don't satisfy cascade delete in schema
    await db.cartItem.deleteMany({
      where: {
        productId: productId,
      },
    });

    await db.reservation.deleteMany({
      where: {
        productId: productId,
        orderId: null,
      },
    });

    // Delete order items and quotation items associated with the product
    // WARNING: This alters historical data (orders/quotations will lose line items)
    await db.rentalOrderItem.deleteMany({
      where: {
        productId: productId,
      },
    });

    await db.quotationItem.deleteMany({
      where: {
        productId: productId,
      },
    });

    await db.product.delete({
      where: {
        id: productId,
      },
    });

    revalidatePath("/vendor/products");
    return { success: "Product deleted" };
  } catch (error) {
    console.error("Delete product error:", error);
    return { error: `Failed to delete product: ${(error as Error).message}` };
  }
}

export async function updateProduct(productId: string, data: z.infer<typeof ProductSchema>) {
  const session = await auth();

  if (!session?.user || session.user.role !== UserRole.VENDOR) {
    return { error: "Unauthorized" };
  }

  const validatedFields = ProductSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const {
    name,
    description,
    basePrice,
    costPrice,
    quantity,
    categoryId,
    images,
    isPublished,
    minRentalPeriod,
    securityDeposit
  } = validatedFields.data;

  try {
    const product = await db.product.findUnique({
      where: {
        id: productId,
        vendorId: session.user.id,
      },
    });

    if (!product) {
      return { error: "Product not found or unauthorized" };
    }

    await db.product.update({
      where: {
        id: productId,
      },
      data: {
        name,
        description,
        basePrice,
        costPrice,
        quantity,
        categoryId,
        isPublished,
        minRentalPeriod,
        securityDeposit,
        images: {
          deleteMany: {}, // Simplification: remove old images and add new ones (not efficient for large changes but works)
          create: images.map((url, index) => ({
            url,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        }
      },
    });

    revalidatePath("/vendor/products");
    revalidatePath(`/vendor/products/${productId}`);
    return { success: "Product updated" };
  } catch (error) {
    console.error("Update product error:", error);
    return { error: "Failed to update product" };
  }
}
