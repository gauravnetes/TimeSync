"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getUserAvailability() {
    const { userId } = await auth(); 

    if(!userId) throw new Error("Unauthorized")

    const user = await db.user.findUnique({
        where: { clerkUserId: userId }, 
        include: {
            availability: {
                include: { days: true }
            }
        }
    }); 

    if(!user || !user.availability) {
        return null; 
    }

    const availabilityData = {
        timeGap: user.availability.timeGap
    }; 

    [
        "monday", 
        "tuesday", 
        "wednesday", 
        "thursday", 
        "friday", 
        "saturday", 
        "sunday", 
    ].forEach((day) => {
        const dayAvailability = user.availability.days.find((d) => d.day === day.toUpperCase());
        
        availabilityData[day] = {
            isAvailable: !!dayAvailability, // if day available -> true || day not available -> false 
            startTime: dayAvailability ? dayAvailability.startTime.toISOString().slice(11, 16) : "09:00", // slice the time 
            endTime: dayAvailability ? dayAvailability.endTime.toISOString().slice(11, 16) : "17:00", 
        }
    })
    return availabilityData; 
}

export async function updateAvailability(data) {
    const { userId } = await auth(); 

    if(!userId) throw new Error("Unauthorized")

    const user = await db.user.findUnique({
        where: { clerkUserId: userId }, 
        include: {
            availability: true, 
        }
    }); 
 
    if(!user) {
        throw new Error("User Not Found") 
    }

    const availabilityData = Object.entries(data) // each entries is converted into a seperate array

    availabilityData.flatMap(([day, { isAvailable, startTime, endTime }]) => {
        if (isAvailable) {
            const baseDate = new Date().toString().split("T")[0]
            console.log(baseDate)
            return [
                {
                    day: day.toUpperCase(), 
                    startTime: new Date(`${baseDate}T${startTime}:00Z`), 
                    endTime: new Date(`${baseDate}T${endTime}:00Z`)
                }
            ]
        }

        return []; 
    })
    // console.log(availabilityData)
}