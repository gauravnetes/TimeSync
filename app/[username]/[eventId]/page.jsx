
import { getEventAvailability, getEventDetails } from '@/actions/events';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import EventDetails from './_components/event-details';
import BookingForm from './_components/booking-form';


// Next.js 14+ with App Router uses React Server Components and async contexts — parameters like params, searchParams, request etc., must not be accessed directly if destructured too early, as their actual value is available after resolution.

export async function generateMetadata({ params }) {
    const { username, eventId } = await params; 
    // console.log(username, eventId)

    const event = await getEventDetails(username, eventId);

    if (!event) {
        return {
            title: "Event Not Found",
        };
    }

    return {
        title: `Book ${event.title} with ${event.user.name} | TimeSync`,
        description: `Schedule a ${event.duration}-minute ${event.title} event with ${event.user.name}.`,
    };
}

export default async function EventBookingPage({ params }) {
    const { username, eventId} = await params; 

    // console.log(username, eventId)

    const event = await getEventDetails(username, eventId);
    const availability = await getEventAvailability(eventId);

    // console.log(event)
    // console.log(availability)

    if (!event) {
        notFound();
    }

    return (
        <div className="flex flex-col justify-center lg:flex-row px-4 py-8">
            <EventDetails event={event} />
            <Suspense fallback={<div>Loading booking form...</div>}>
                <BookingForm event={event} availability={availability} />
            </Suspense>
        </div>
    );
}