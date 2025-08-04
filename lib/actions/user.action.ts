"use server";

import { Role } from "@prisma/client";
import { prisma } from "../prisma";
import { hash } from "bcrypt";
import { auth } from "@/auth";
import { adminAndManager, onlyAdmin } from "../access.utils";

export async function createUser(data: {
  username: string;
  password: string;
  name: string;
  role: Role;
}) {
  const { username, password, name, role } = data;

  await adminAndManager();
  const session = await auth();

  if (password.length < 8) {
    return {
      success: false,
      message: "Password must be at least 8 characters long.",
    };
  }

  if (username.length < 5) {
    return {
      success: false,
      message: "Username must be at least 5 characters long.",
    };
  }
  if (name.length < 4) {
    return {
      success: false,
      message: "Name must be atleast 5 characters long",
    };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Username already taken.",
      };
    }

    if (session?.user?.role === "MANAGER" && role !== Role.SALES_AGENT) {
      return {
        success: false,
        message: "You only have access to create sales agent",
      };
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role,
      },
    });

    return {
      success: true,
      message: "User created successfully.",
      user,
    };
  } catch (error) {
    console.error("Create user error:", error);
    return {
      success: false,
      message: "An error occurred while creating the user.",
    };
  }
}

export async function deleteUser(id: string) {
  onlyAdmin();
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return { success: false, message: "User not found" };
    }
    if (user.role == Role.ADMIN) {
      return { success: false, message: "You can't delete an admin user" };
    }
    const deleteUser = await prisma.user.delete({ where: { id } });
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    return { success: false, message: "Something went wrong" };
  }
}
