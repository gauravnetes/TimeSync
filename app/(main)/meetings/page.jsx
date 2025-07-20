import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


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
            <TabsContent value="upcoming">Make changes to your account here.</TabsContent>
            <TabsContent value="Past">Change your password here.</TabsContent>
        </Tabs>
    )
}

export default MeetingPage
