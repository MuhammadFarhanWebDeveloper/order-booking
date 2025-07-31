"use server";

import { prisma } from "../prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { success, z } from "zod";

export const getProducts = async () => {
  const { userId } = await auth();
  if (!userId) {
    return [];
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  if (!user) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      userId: user.id,
    },
    include: {
      variants: true,
    },
  });
  return products;
};

const variantSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().min(0),
});

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  variants: z.array(variantSchema).min(1),
});

export async function addProduct(data: unknown) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      throw new Error("Unauthorized");
    }

    const parsed = productSchema.safeParse(data);
    if (!parsed.success) {
      console.error(parsed.error.format());
      throw new Error("Validation failed");
    }

    const { name, description, variants } = parsed.data;

    const dbUser = await prisma.user.findFirst({
      where: {
        clerkId: user.id,
      },
    });

    if (!dbUser) {
      throw new Error("User not found in DB");
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        userId: dbUser.id,
        variants: {
          create: variants,
        },
      },
      include: { variants: true },
    });

    return product;
  } catch (error: any) {
    console.error("addProduct error:", error);
    throw new Error("Something went wrong while adding the product.");
  }
}

export async function deleteProduct(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };

    const user = await prisma.user.findFirst({
      where: {
        clerkId: userId,
      },
    });
    if (!user) return { success: false, message: "User not found" };

    const product = await prisma.product.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });
    if (!product)
      return {
        success: false,
        message: "Product not found or not owned by user",
      };

    await prisma.product.delete({
      where: {
        id,
      },
    });

    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, message: "Failed to delete product" };
  }
}
