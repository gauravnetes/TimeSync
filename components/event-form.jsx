"use client"

import { eventSchema } from '@/_lib/validators'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Input } from './ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Select, SelectContent, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectItem } from '@/components/ui/select'
import { Button } from './ui/button'
import useFetch from '@/hooks/use-fetch'
import { createEvent } from '@/actions/events'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

const EventForm = ({ onSubmitForm }) => {
    const router = useRouter()
    const { isSignedIn } = useAuth(); 
    
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },

    } = useForm({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            duration: 30,
            isPrivate: true,
        },
    });

    const { loading, error, fn: fnCreateEvent } = useFetch(createEvent)

    const onSubmit = async (data) => {
        if (!isSignedIn) {
            router.push("/sign-in"); 
            return; 
        }

        await fnCreateEvent(data);
        if (!loading && !error) 
            onSubmitForm()
        
        router.refresh(); 
    }

    return (
        <form className='px-5 flex flex-col gap-4' onSubmit={handleSubmit(onSubmit)}>
            {/* Title */}
            <div>
                <label
                    htmlFor='title'
                    className='block text-sm font-medium text-gray-700 ml-1'
                >
                    Event Title
                </label>

                <Input id="title" {...register("title")} className="mt-1" />

                {errors.title && (
                    <p className='text-red-500 text-sm mt-1'>
                        {errors.title.message}
                    </p>
                )}
            </div>

            {/* Description */}
            <div>
                <label
                    htmlFor='description'
                    className='block text-sm font-medium text-gray-700 ml-1'
                >
                    Event Description
                </label>

                <Input id="description" {...register("description")} className="mt-1" />

                {errors.description && (
                    <p className='text-red-500 text-sm mt-1'>
                        {errors.description.message}
                    </p>
                )}
            </div>

            {/* Duration */}
            <div>
                <label
                    htmlFor='duration'
                    className='block text-sm font-medium text-gray-700 ml-1'
                >
                    Duration (minutes)
                </label>

                <Input id="duration" {...register("duration", {
                    valueAsNumber: true,
                })}
                    className="mt-1"
                    type="number"
                />

                {errors.duration && (
                    <p className='text-red-500 text-sm mt-1'>
                        {errors.duration.message}
                    </p>
                )}
            </div>

            {/* isPrivate */}
            <div>
                <label
                    htmlFor='isPrivate'
                    className='block text-sm font-medium text-gray-700 ml-1'
                >
                    Event Privacy
                </label>

                {/* select values can't be merged with the react-hook-form with the ...register, so we need controllers */}
                <Controller
                    name='isPrivate'
                    control={control} // Passed from useForm(), gives the controller access to the form methods/state
                    render={({ field }) => (

                        // What Happens When You Select an Option:
                        // You choose “Private”
                        // onValueChange fires with "true"
                        // field.onChange(value === "true") converts it to true (boolean) and updates the form state for isPrivate
                        // react-hook-form rerenders this input with value="true" (due to field.value ? "true" : "false")
                        <Select
                            value={field.value ? "true" : "false"} // providing default values
                            onValueChange={(value) => field.onChange(value === "true")}
                        >
                            <SelectTrigger className="w-[180px] mt-1">
                                <SelectValue placeholder="Select Privacy" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Privacy</SelectLabel>
                                    <SelectItem value="true">Private</SelectItem>
                                    <SelectItem value="false">Public</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}
                />


                {errors.isPrivate && (
                    <p className='text-red-500 text-sm mt-1'>
                        {errors.isPrivate.message}
                    </p>
                )}
            </div>

            {error && <p className='text-red-500 text-xs mt-1'>{error.message}</p>}
                {/* if loading = true, button -> disabled */}
            <Button type="submit" disabled={loading} >
                {loading ? "Creating your Event..." :  "Create Event"}
            </Button>
        </form>
    )
}

export default EventForm
