"use server";

import z from "zod";
import { prisma } from "../prisma";
import { auth } from "@clerk/nextjs/server";

export const getCustomers = async () => {
     const { userId } = await auth();
    if (!userId) {
      return []
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });
    if (!user) {
      return []
    }
    
  const customers = await prisma.customer.findMany({where:{
    userId:user.id
  }});
  return customers;
};

const customerSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
  address: z.string().optional(),
});
type Customer = z.infer<typeof customerSchema>;

export const addCustomer = async (data: Customer) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    // Validate input data
    const parsed = customerSchema.safeParse(data);
    if (!parsed.success) {
      console.error("Validation error:", parsed.error.format());
      return { 
        success: false, 
        message: "Invalid customer data",
        errors: parsed.error.flatten() 
      };
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Create customer with relationship to user
    const customer = await prisma.customer.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        address: parsed.data.address,
        user: { connect: { id: user.id } }
      }
    });

    return { 
      success: true, 
      message: "Customer created successfully",
      customer 
    };

  } catch (error) {
    console.error("Error creating customer:", error);
    
    return { 
      success: false, 
      message: "Failed to create customer",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};