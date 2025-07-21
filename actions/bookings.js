/* 
Things to verify:  
1. if the event exists or not
2. if it does exist, schedule the event in user's calendar
3. Add the event booking inside of db. 
*/
"use server"

import { db } from "@/lib/prisma";
import clerkClient from "@clerk/clerk-sdk-node";
import { google } from "googleapis";

export async function createBooking(bookingData) {
    try {
        const event = await db.event.findUnique({
            where: { id: bookingData.eventId },  // passing the eventId in the booking Schema 
            include: { user: true }, 
        }); 

        if (!event) {
            throw new Error("Event not Found")
        }

        // console.log(event)
        // console.log(event.user.clerkUserId)

        const user = await clerkClient.users.getUser(event.user.clerkUserId)
        console.log("OAuth identifies: ", user.externalAccounts); 
        // use google calendar api to generate meet link and add to calendar 
        // fetch the google OAuth access token added to the clerk
        const tokenRes = await clerkClient.users.getUserOauthAccessToken(
            event.user.clerkUserId, // provide the clerkUserId
            "oauth_google"
        );

        console.log("Token response: ", tokenRes)
        const token = tokenRes[0]?.token // take out a token from the first child of the data 

        if(!token) {
            throw new Error("Event creator has not connected Google Calendar")
        }

        // set up the Google OAuth Client 
        const oauth2Client = new google.auth.OAuth2()
        oauth2Client.setCredentials({ access_token: token }) // pass the google oauth access token fetched from clerk

        const calendar = google.calendar({ version: "v3", auth: oauth2Client })

        const meetRes = await calendar.events.insert({
            calendarId: "primary", 
            conferenceDataVersion: 1, 
            requestBody: {
                summary: `${bookingData.name} - ${event.title}`, 
                description: bookingData.additionalInfo, 
                start: { dateTime: bookingData.startTime }, 
                end: { dateTime: bookingData.endTime }, 
                attendees: [{ email: bookingData.email }, { email: event.user.email }], 
                // bookingData.email -> The one who is booking the event / meet 
                // email.event.user.email -> email of with whom we're booking it. 

                // to generate the ID of the event 
                conferenceData: {
                    createRequest: { requestId: `${event.id}-${Date.now()}` }, 
                }, 
            }, 
        })

        const meetLink = meetRes.data.hangoutLink; 
        const googleEventId = meetRes.data.id; 

        const booking = await db.booking.create({
            data: {
                eventId: event.id, 
                userId: event.userId, 
                name: bookingData.name, 
                email: bookingData.email, 
                startTime: bookingData.startTime, 
                endTime: bookingData.endTime, 
                additionalInfo: bookingData.additionalInfo, 
                meetLink, 
                googleEventId, 
            }, 
        })
        
        return { success: true, booking, meetLink }; 
    } catch (error) {
        console.error("Error creating Booking", error)
        return { success: false, error: error.message }
    }
}


// IMP Note: 
/*
const { data } = await clerkClient.users.getUserOauthAccessToken(...);

it destructures the response expecting the returned object to be like:
{ data: [...] }

But if getUserOauthAccessToken() returns an array directly, like this:
[ { token: "...", provider: "oauth_google", ... } ]

const data = await clerkClient.users.getUserOauthAccessToken(...);
const token = data[0].token

demo response: 


*/