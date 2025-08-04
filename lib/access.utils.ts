import { auth } from "@/auth";
import { Role } from "@prisma/client";

export const onlyAdmin = async () => {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Invalid authentication" };
  }
  const { role } = session.user;
  if (role !== Role.ADMIN) {
    return { success: false, message: "You dont have access to this action" };
  }
};

export const adminAndManager = async () => {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Invalid authentication" };
  }
  const { role } = session.user;

  if (role !== Role.ADMIN && role !== Role.MANAGER) {
    return { success: false, message: "You don't have access to this action" };
  }
};
