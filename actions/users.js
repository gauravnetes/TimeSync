"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function updateUsername(username) {
  // if userId is valid one, that means if the user who wants update the username, the userId belongs to them or not
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const existingUsername = await db.user.findUnique({
    where: { username },
  });

//   if an existing user have already taken an username, and another user tires to update the username, they'll be denied. as there is existingUsername and the existingUsername.id is != current userId
  if (existingUsername && existingUsername.id !== userId)
    throw new Error("Username already taken!");

  await db.user.update({
    where: { clerkUserId: userId },
    data: { username },
  });

  try {
    await clerkClient.users.updateUser(userId, {
      username
    }); 
  } catch (error) {
    console.log(error)
  }

  return { success: true, message: "Username updated Successfully" }
}
