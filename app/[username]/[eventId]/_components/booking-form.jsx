"use client"

import { bookingSchema } from '@/_lib/validators'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { useForm } from 'react-hook-form'
import "react-day-picker/style.css"
import { timeSlots } from '@/app/(main)/availability/data'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import useFetch from '@/hooks/use-fetch'
import { createBooking } from '@/actions/bookings'

const BookingForm = ({ event, availability }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);


  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(bookingSchema)
  })

  const availableDays = availability.map((day) => new Date(day.date))

  // if we have a date selected, then for that particular day find the available slots from the availability array for that particular day
  const timeSlots = selectedDate ? availability.find((day) => day.date === format(selectedDate, "yyyy-MM-dd"))?.slots || [] : [];


  // to choose date and time (required fields of bookingSchema) we could select controllers but we can also do it manually by using useEffect to accept the values 
  useEffect(() => {
    if(selectedDate) 
      setValue("date", format(selectedDate, "yyyy-MM-dd"))
    
  }, [selectedDate])

  useEffect(() => {
    if(selectedTime) 
      setValue("time", selectedTime)

  }, [selectedTime])

  const { loading, data, fn: fnCreateBooking, error } = useFetch(createBooking)

  const onSubmit = async (data) => {
    console.log("Form submitted with data: ", data) 
    if(!selectedDate || !selectedTime) {
      console.error("Date or Time aren't selected"); 
      return; 
    }

    const startTime = new Date(
      `${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}`
    ); 
    

    const endTime = new Date(
      startTime.getTime() + event.duration * 60000
    )
    // .getTime() gives the timestamp in miliseconds 
    const bookingData = {
      eventId: event.id, 
      name: data.name, 
      email: data.email, 
      startTime: startTime.toISOString(), 
      endTime: endTime.toISOString(), 
      additionalInfo: data.additionalInfo, 
    }; 

    await fnCreateBooking(bookingData)
  }
  

  if(data) {
    return (
      <div className='text-center p-10 border bg-white'>
        <h2 className='text-2xl font-bold mb-4'>Booking Successful</h2>
        {data.meetLink && (
          <p>
            Join The Meeting: {" "}
            <a 
            href={data.meetLink}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-500 hover:underline'
            >
              {data.meetLink}
            </a>
          </p>
        )}
      </div>
    )
  }


  return (
    <div className='flex flex-col gap-8 p-10 border bg-white'>
      {/* datePicker & Times */}
      <div className='md:h-96 flex flex-col md:flex-row gap-5'>
        {/* datepicker */}
        <div className='w-full'>
          <DayPicker
            mode='single' // no. of selection -> single / multiple / range 
            selected={selectedDate} // state 
            onSelect={(date) => {
              setSelectedDate(date) // when changing the date 
              setSelectedTime(null) // when changing the date the default value of time will be null
            }}
            disabled={[{ before: new Date() }]} // disable the dates before the current date 
            modifiers={{
              available: availableDays,
            }}

            modifiersStyles={{
              available: {
                background: "lightblue",
                borderRadius: 100,
              }
            }}
          />
        </div>

        {/* time slots */}
        <div className='w-full h-full md:overflow-scroll no-scrollbar'>
          {selectedDate && (
            <div className='mb-4'>
              <h3 className='text-lg font-semibold mb-2'>Available Time Slots</h3>
              <div className='grid grid-cols-2 lg:grid-cols-3 gap-2'>
                {timeSlots.map((slot) => {
                  return <Button 
                  key={slot} 
                  onClick={() => setSelectedTime(slot)}
                  variant={selectedTime === slot ? "default" : "outline"} 
                  > 
                    {slot} 
                  </Button>
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* form */}
      {selectedTime && (
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>

        <div>
          <Input {...register("name")} placeholder="Your Name" />
          {errors.name && (
            <p className='text-red-500 text-sm'>{errors.name.message}</p>
          )}
        </div>

        <div>
          <Input {...register("email")} placeholder="Your Email" />
          {errors.email && (
            <p className='text-red-500 text-sm'>{errors.email.message}</p>
          )}
        </div>

        <div>
          <Textarea {...register("additionalInfo")} placeholder="Additional Information" />
          {errors.additionalInfo && (
            <p className='text-red-500 text-sm'>{errors.additionalInfo.message}</p>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full" >
          {loading ? "Scheduling..." : "Scheduling Event"}
        </Button>

      </form>
      
      )}

    </div>
  )
}

export default BookingForm
