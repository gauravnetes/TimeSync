"use server";

import { eventSchema } from "@/_lib/validators";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createEvent(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validatedData = eventSchema.parse(data);

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User Not Found");

  const event = await db.event.create({
    data: {
      ...validatedData,
      userId: user.id, // db unique userId
    },
  });

  return event;
}

export async function getUserEvents(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User Not Found");
  }

  const events = await db.event.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { bookings: true }, // gives us the count of that single event
      },
    },
  });

  return { events, username: user.username }; // returning the user.username for copy feature in the event url
}

export async function deleteEvent(eventId) {
  const { userId } = await auth(); 
  if(!userId) throw new Error("Unauthorized")

  const user = await db.user.findUnique({
    where: { clerkUserId: userId }
  })

  if(!user) throw new Error("User Not Found")

  const event = await db.event.findUnique({
    where: {id: eventId}
  })

  if(!event || event.userId !== user.id) 
    throw new Error("Event not found or unauthorized")

  await db.event.delete({
    where: { id: eventId }
  })

  return { success: true }; // returning the user.username for copy feature in the event url
}
