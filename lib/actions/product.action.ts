"use server";

import { prisma } from "../prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 🧠 Zod enums must match your Prisma enums (case-sensitive)
const categoryEnum = z.enum([
  "ELECTRONICS",
  "GROCERY",
  "CLOTHING",
  "STATIONERY",
  "BEAUTY",
  "FURNITURE",
  "TOYS",
  "MEDICINE",
  "OTHER",
]);

const unitEnum = z.enum([
  "PIECE",
  "GRAM",
  "KILOGRAM",
  "LITRE",
  "MILLILITRE",
  "METER",
  "CENTIMETER",
  "BOX",
  "PACK",
]);

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: categoryEnum,
  unit: unitEnum,
  price: z.coerce.number().min(0),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const getProducts = async () => {
  const products = await prisma.product.findMany();
  return products;
};

export async function addProduct(data: unknown) {
  try {
    // const user = await currentUser();
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const parsed = productSchema.safeParse(data);
    if (!parsed.success) {
      console.error(parsed.error.format());
      throw new Error("Validation failed");
    }

    const { name, description, category, unit, price } = parsed.data;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        unit,
        price,
      },
    });

    return product;
  } catch (error: any) {
    console.error("addProduct error:", error);
    throw new Error("Something went wrong while adding the product.");
  }
}

export async function deleteProduct(id: string) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id,
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

export async function updateProduct(id: string, data: ProductFormValues) {
  try {
    const product = await prisma.product.update({
      where: { id: id },
      data: {
        ...data,
      },
    });

    return {success:true, message:"Product edited successfully",product}
  } catch (error) {
    console.error("Error editing product:", error);
    return { success: false, message: "Failed to edit product" };
  }
}
