import React, { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MeetingList from './_components/meeting-list'
import { getUserMeetings } from '@/actions/meetings'


export const metadata = {
    title: "Your Meeting | TimeSync",
    description: "View and manage your upcoming and past meetings",
}

// using tabs component to switch between upcoming and past meetings
// 

const MeetingPage = () => {
    return (
        <Tabs defaultValue="upcoming">
            <TabsList>
                <TabsTrigger value="upcoming">Upcoming Meetings</TabsTrigger>
                <TabsTrigger value="past">Past Meetings</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
                <Suspense fallback={<div>Loading upcoming meetings...</div>} >
                    <UpcomingMeetings />
                </Suspense>
            </TabsContent>
            <TabsContent value="past">
                <Suspense fallback={<div>Loading past meetings...</div>} >
                    <PastMeetings />
                </Suspense>
            </TabsContent>
        </Tabs>
    )
}

async function UpcomingMeetings() {
    const meetings = await getUserMeetings("upcoming")
    return <MeetingList meetings={meetings} type="upcoming" />
}

async function PastMeetings() {
    const meetings = await getUserMeetings("past")
    return <MeetingList meetings={meetings} type="past" />
}

export default MeetingPage
