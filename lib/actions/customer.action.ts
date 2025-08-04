"use server";

import z from "zod";
import { prisma } from "../prisma";
import { CustomerFormValues } from "@/components/CustomerForm";
import { onlyAdmin } from "../access.utils";


const customerSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
  address: z.string().optional(),
});
type Customer = z.infer<typeof customerSchema>;

export const addCustomer = async (data: Customer) => {
  try {
    await onlyAdmin()
    const parsed = customerSchema.safeParse(data);
    if (!parsed.success) {
      console.error("Validation error:", parsed.error.format());
      return {
        success: false,
        message: "Invalid customer data",
        errors: parsed.error.flatten(),
      };
    }

    // Create customer with relationship to user
    const customer = await prisma.customer.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        address: parsed.data.address,
      },
    });

    return {
      success: true,
      message: "Customer created successfully",
      customer,
    };
  } catch (error) {
    console.error("Error creating customer:", error);

    return {
      success: false,
      message: "Failed to create customer",
    };
  }
};

export const deleteCustomer = async (id: string) => {
  try {
        await onlyAdmin()

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return { success: false, message: "Customer not found" };
    }

    const deleteCustomer = await prisma.customer.delete({
      where: {
        id,
      },
    });

    return { success: true, message: "Customer deleted successfully" };
  } catch (error) {
    console.error("Error deleting customer:", error);

    return {
      success: false,
      message: "Failed to delete customer",
    };
  }
};

export const updateCustomer = async (id: string, data: CustomerFormValues) => {
  try {
        await onlyAdmin()

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...data,
      },
    });

    return { success: true };
  } catch (err) {
    return { success: false, message: "Something went wrong" };
  }
};
