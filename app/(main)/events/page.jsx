import { getUserEvents } from "@/actions/events"
import EventCard from "@/components/event-card";
import { Suspense } from "react"

export default function EventsPage() {
  return (
    // use fallback ui as the data might not be rightly available 
    <Suspense fallback={<div>Loading Events...</div>} >
      <Events />
    </Suspense>
  )
}

const Events = async () => {

  const { events, username } = await getUserEvents();
  // as it's server rendered component it'll not rerun it again and again like client. possible in Next.js not in React.js
  if (events.length === 0)
    return <p>You haven&apos;t created any events yet.</p>
  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      {events.map((event) => (
        <EventCard key={event.id} event={event} username={username} />
      ))}
    </div>
  )
}

