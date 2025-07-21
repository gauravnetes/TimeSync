
import React from 'react'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Calendar, Clock, Video } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import CancelMeeting from './cancel-meeting'
const MeetingList = ({ meetings, type }) => {
    if (meetings.length === 0) {
        return <p>No {type} meetings</p>
    }
    console.log("meetings: ", meetings)
    

    return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {meetings.map((meeting) => (
                <Card key={meeting.id} className="flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle>{meeting.event.title}</CardTitle>
                        <CardDescription>
                            with <span className='font-semibold'>{meeting.name}</span>
                        </CardDescription>
                        <CardDescription>&quot;{meeting.additionalInfo}&quot;</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* meeting date */}
                        <div className='flex items-center mb-2'>
                            <Calendar className='mr-2 h-4 w-4' />
                            <span>
                                {format(new Date(meeting.startTime), "MMMM d, yyyy")}
                            </span>
                        </div>

                        {/* meet time */}
                        <div className='flex items-center mb-2'>
                            <Clock className='mr-2 h-4 w-4' />
                            <span>
                                {format(new Date(meeting.startTime), "h:mm a")} -{" "}
                                {format(new Date(meeting.endTime), "h:mm a")}
                            </span>
                        </div>

                        {/* meet link */}
                        {meeting.meetLink && (
                            <div className='flex items-center mb-2'>
                            <Video className='mr-2 h-4 w-4' />
                            <a
                            href={meeting.meetLink}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-500 hover:underline'
                            >
                                Join Meeting
                            </a>
                        </div>
                        )}
                    </CardContent>
                    <CardFooter>
                            <CancelMeeting meetingId={meeting.id} />
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

export default MeetingList


// noopener
// Prevents the new page (i.e., the one opened by your link) from being able to access the window.opener object.

// This is crucial because malicious sites can use window.opener to run JavaScript in your page's context (called reverse tabnabbing).

// noreferrer
// Prevents the browser from sending the HTTP Referer header to the linked page. That means the new site won’t know what page the user came from.

// Also implies noopener, so noreferrer alone would suffice for protection.

// But people often write both to be extra explicit and for compatibility across all browsers.