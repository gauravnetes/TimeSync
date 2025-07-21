"use server"

import { db } from "@/lib/prisma";
import clerkClient from "@clerk/clerk-sdk-node";
import { auth } from "@clerk/nextjs/server";
import { google } from "googleapis";

export async function getUserMeetings(type = "upcoming") {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not Found");

  const now = new Date();

  const meetings = await db.booking.findMany({
    where: {
      userId: user.id,
      startTime: type === "upcoming" ? { gte: now } : { lt: now },
      // gte => greateer than equals to, lt: less than now
      // basically if we're on the upcoming tab type === "upcoming" then fetch the meetings with startTime  timed greater than equals to the current time other wise if it's a meeting of past, type === "past" then fetch the meet bookings where the startTime is less than the current time.
    },
    include: {
      event: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            }, 
          },
        },
      },
    },
    orderBy: {
      startTime: type === "upcoming" ? "asc" : "desc"
      // if it's an upcoming meeting then order it accoring to ascending order of startTime, if it's past meeting then descending order 
    }
  });

  console.log(meetings)

  return meetings; 
}


export async function cancelMeeting(meetingId) {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not Found");

  const meeting = await db.booking.findUnique({
    where: { id: meetingId }, 
    include: {
      event: true, 
      user: true, 
    }, 
  })

  if (!meeting || meeting.userId !== user.id) {
    throw new Error("Meeting Not Found or Unauthorized");     
  }

  const data = await clerkClient.users.getUserOauthAccessToken(
    meeting.user.clerkUserId, 
    "oauth_google" 
  ); 
  const token = data[0]?.token;

  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: token })
  // This allows you to act on behalf of the user who created the event.

  const calendar = google.calendar({ version: "v3", auth: oauth2Client })

  // console.log("Calendar: ", calendar)
  console.log(meeting.googleEventId)
  try {
    // Delete the event from the primary calendar of the user authenticated via that token.
    await calendar.events.delete({
      calendarId: "primary",
      eventId: meeting.googleEventId,
    })
  } catch (error) {
    console.error("Failed to delete event from the Google Calendar", error); 
  }

  await db.booking.delete({
    where: { id: meetingId }, 
  }); 

  return { success: true }
}