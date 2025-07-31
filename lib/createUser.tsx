"use server";

import { prisma } from "./prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function createUserIfNotExists() {
  const user = await currentUser();
  if (!user || !user.id || !user.emailAddresses?.length) return null;

  const clerkId = user.id;
  const email = user.emailAddresses[0].emailAddress;
  const name = user.firstName ?? user.username ?? null;

  const dbUser = await prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: {
      clerkId,
      email,
      name,
    },
  });

  return dbUser;
}
