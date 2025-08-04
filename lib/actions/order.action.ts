"use server";

import z from "zod";
import { prisma } from "../prisma";
import { OrderStatus, Prisma } from "@prisma/client";
import { adminAndManager } from "../access.utils";

export const getOrders = async () => {


  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    success: true,
    data: orders,
  };
};

const orderSchema = z.object({
  status: z.enum(["PENDING", "COMPLETED", "CANCELED"]).default("PENDING"),
  customerId: z.string(),
  productIds: z.array(z.string()),
  totalAmount: z.number().min(0),
});

type OrderFormInput = z.infer<typeof orderSchema>;

export const addOrder = async (data: OrderFormInput) => {

  await adminAndManager()

  const parsed = orderSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Validation error:", parsed.error.format());
    return {
      success: false,
      message: "Invalid order data",
      errors: parsed.error.flatten(),
    };
  }

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: parsed.data.productIds,
      },
    },
  });

  if (products.length !== parsed.data.productIds.length) {
    return { success: false, message: "Some products not found" };
  }

  const orderItems = products.map((product) => ({
    product: { connect: { id: product.id } },
    quantity: 1, 
    price: product.price,
  }));

  const order = await prisma.order.create({
    data: {
      status: parsed.data.status,
      totalAmount: parsed.data.totalAmount, 
      customerId: parsed.data.customerId,
      items: {
        create: orderItems,
      },
    },
  });

  return {
    success: true,
    message: "Order created successfully",
    data: order,
  };
};

export const deleteOrder = async (id: string) => {
  try {
      await adminAndManager()

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return { success: false, message: "Order not found" };
    }

    const deleteOrder = await prisma.order.delete({
      where: {
        id,
      },
    });

    return { success: true, message: "Order deleted successfully" };
  } catch (error) {
    console.error("Error deleting order:", error);

    return {
      success: false,
      message: "Failed to delete order",
    };
  }
};

export const updateOrderStatus = async (id: string, newStatus: OrderStatus) => {
  try {
      await adminAndManager()

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: newStatus },
    });

    return {
      success: true,
      message: `Order marked as ${newStatus.toLowerCase()}.`,
      order: updatedOrder,
    };
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return {
        success: false,
        message: "Order not found.",
      };
    }

    console.error("Failed to update order:", error);

    return {
      success: false,
      message: "Something went wrong while updating the order.",
    };
  }
};

export const updateOrder = async (
  id: string,
  data: {
    status: OrderStatus;
    customerId: string;
    items: string[]; 
    totalAmount: number;
  }
) => {

    await adminAndManager()


  const parsed = orderSchema.safeParse({
    status: data.status,
    customerId: data.customerId,
    productIds: data.items,
    totalAmount: data.totalAmount,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten(),
    };
  }

  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return { success: false, message: "Order not found" };
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: parsed.data.productIds },
      },
    });

    if (products.length !== parsed.data.productIds.length) {
      return {
        success: false,
        message: "One or more selected products do not exist",
      };
    }

    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    });

    const orderItems = products.map((product) => ({
      orderId: id,
      productId: product.id,
      price: product.price,
    }));

    await prisma.orderItem.createMany({
      data: orderItems,
    });

    const newOrder = await prisma.order.update({
      where: { id },
      data: {
        status: parsed.data.status,
        customerId: parsed.data.customerId,
        totalAmount: parsed.data.totalAmount,
      },
      include: {
        items: {
          include: {
            product: true, 
          },
        },
        customer: true, 
      },
    });

    return {
      success: true,
      message: "Order updated successfully",
      order: newOrder,
    };
  } catch (error) {
    console.error("updateOrder error:", error);
    return {
      success: false,
      message: "Failed to update the order",
    };
  }
};
