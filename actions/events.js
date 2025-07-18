"use server";

import { eventSchema } from "@/_lib/validators";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

import {
  addDays,
  addMinutes,
  format,
  isBefore,
  parseISO,
  startOfDay,
} from "date-fns";

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
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User Not Found");

  const event = await db.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.userId !== user.id)
    throw new Error("Event not found or unauthorized");

  await db.event.delete({
    where: { id: eventId },
  });

  return { success: true }; // returning the user.username for copy feature in the event url
}

export async function getEventDetails(username, eventId) {
  const event = await db.event.findFirst({
    where: {
      id: eventId,
      user: {
        username: username,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          imageUrl: true,
          username: true,
        },
      },
    },
  });

  return event;
}

// get the availability details with respect to an event.
export async function getEventAvailability(eventId) {
  const event = await db.event.findUnique({
    where: {
      id: eventId,
    },
    // include the user who've created this event
    include: {
      user: {
        // include the availability of the user who have created this event
        include: {
          availability: {
            select: {
              days: true,
              timeGap: true,
            },
          },
          // include the bookings related to this event for this particular user
          bookings: {
            select: {
              startTime: true,
              endTime: true,
            },
          },
        },
      },
    },
  });

  if (!event || !event.user.availability) {
    return [];
  }

  // take out the availability and bookings for that particular user who've created this event
  const { availability, bookings } = event.user;

  // we'll show
  const startDate = startOfDay(new Date());
  const endDate = addDays(startDate, 30);

  const availableDates = [];

  for (let date = startDate; date <= endDate; date = addDays(startDate, 1)) {
    // dayOfWeek of that particular day
    const dayOfWeek = format(date, "EEEE").toUpperCase();

    // is user available on that particular day
    const dayAvailability = availability.days.find((d) => d.day === dayOfWeek);

    if (dayAvailability) {
      const dateStr = format(date, "yyyy-MM-dd");

      const slots = generateAvailableTimeSlots(
        dayAvailability.startTime,
        dayAvailability.endTime,
        event.duration,
        bookings,
        dateStr,
        availability.timeGap
      );

      availableDates.push({
        date: dateStr,
        slots,
      });
    }
  }
  return availableDates;
}

// generating available time slots for a specific dateStr, considering:
// Daily working hours (startTime to endTime)
// Slot duration (e.g., 30 mins)
// Existing bookings
// Current time (avoid past)
// gap buffer (timeGap)
const generateAvailableTimeSlots = (
  startTime,
  endTime,
  duration,
  bookings,
  dateStr,
  timeGap = 0
) => {
  const slots = []; // holds the final list of available time slots as strings like "09:00"

  // creating full datetime for the start of first slot
  // if startTime = 9:00 AM, dateStr = "2025-07-15",
  // parse "2025-07-15T09:00"
  let currentTime = parseISO(
    `${dateStr}T${startTime.toISOString().slice(11, 16)}`
  );

  // creating full datetime for the start of end slot
  // if startTime = 9:00 AM, dateStr = "2025-07-15",
  // parse "2025-07-15T09:00"
  const slotEndTime = parseISO(
    `${dateStr}T${endTime.toISOString().slice(11, 16)}`
  );

  // if date is Today and currentTime is already in the past, skip past time
  // add timeGap to currentTime
  // if 10:45 AM now, and timeGap = 15, then currentTime becomes 11:00 AM
  const now = new Date();
  if (format(now, "yyyy-MM-dd") === dateStr) {
    currentTime = isBefore(currentTime, now)
      ? addMinutes(now, timeGap)
      : currentTime;
  }

  // currentTime = 9:00 AM, endTime = 12:00 PM
  // call duration -> 30 mins -> slots = 6

  // loop will go on until we reach the working hours
  // Each loop iteration creates a slot from currentTime → slotEnd
  while (currentTime < slotEndTime) {
    // slotEnd is currentTime + duration
    const slotEnd = new Date(currentTime.getTime() + duration * 60000); // if it's 9:00 am now, slotEndTime = 9:30 am

    // check for the slot availability for this particular call

    // check if all the bookings doesn't contain this particular slot so that the user can book this slot
    const isSlotAvailable = bookings.some((booking) => {
      const bookingStart = booking.startTime;
      const bookingEnd = booking.endTime;

      // if any of these conditions -> true, the slot is Not Available

      // Starts inside an existing booking → currentTime in [bookingStart, bookingEnd)

      // Ends inside an existing booking → slotEnd in (bookingStart, bookingEnd]

      // Completely overlaps an existing booking → [currentTime, slotEnd] covers [bookingStart, bookingEnd]
      return (
        (currentTime >= bookingStart && currentTime < bookingEnd) || // if currentTime falls between bookingStart and bookingEnd -> slot not available
        (slotEnd > bookingStart && slotEnd <= bookingEnd) || // if slotEnd falls between bookingStart and bookingEnd -> slot not available
        (currentTime <= bookingStart && slotEnd >= bookingEnd) // slot not available
      );
    });

    // Only push slot if no conflicts found.
    if (!isSlotAvailable) {
      slots.push(format(currentTime, "HH:mm"));
    }

    currentTime = slotEnd;
  }
  return slots;
};
