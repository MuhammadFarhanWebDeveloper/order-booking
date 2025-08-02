"use server";

import { auth } from "@clerk/nextjs/server";
import z from "zod";
import { prisma } from "../prisma";

const orderSchema = z.object({
  status: z.enum(["PENDING", "COMPLETED", "CANCELED"]).default("PENDING"),
  customerId: z.string(),
  productIds: z.array(z.string()),
  totalAmount:z.number().min(0)
});





type OrderFormInput = z.infer<typeof orderSchema>

export const addOrder = async (data: OrderFormInput) => {
  const { userId } = await auth()
  if (!userId) return { success: false, message: "Invalid authentication" }

  const parsed = orderSchema.safeParse(data)
  if (!parsed.success) {
    console.error("Validation error:", parsed.error.format())
    return {
      success: false,
      message: "Invalid order data",
      errors: parsed.error.flatten(),
    }
  }

  const user = await prisma.user.findFirst({
    where: { clerkId: userId },
  })
  if (!user) return { success: false, message: "User not found" }

  // Fetch product info to get prices
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: parsed.data.productIds,
      },
    },
  })

  if (products.length !== parsed.data.productIds.length) {
    return { success: false, message: "Some products not found" }
  }

  const orderItems = products.map((product) => ({
    product: { connect: { id: product.id } },
    quantity: 1, // Default, or make this dynamic later
    price: product.price,
  }))

  const order = await prisma.order.create({
    data: {
      status: parsed.data.status,
      totalAmount: parsed.data.totalAmount, // Or recalculate from products if needed
      userId: user.id,
      customerId: parsed.data.customerId,
      items: {
        create: orderItems,
      },
    },
  })

  return {
    success: true,
    message: "Order created successfully",
    data: order,
  }
}
