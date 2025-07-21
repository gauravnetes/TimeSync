"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getLatestUpdates() {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not Found");

  const now = new Date();
  const upcomingMeetings = await db.booking.findMany({
    where: {
      userId: user.id,
      startTime: { gte: now },
      // gte => greateer than equals to, lt: less than now
      // basically if we're on the upcoming tab type === "upcoming" then fetch the meetings with startTime  timed greater than equals to the current time other wise if it's a meeting of past, type === "past" then fetch the meet bookings where the startTime is less than the current time.
    },
    include: {
      event: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
    take: 3,
  });

  return upcomingMeetings;
}
