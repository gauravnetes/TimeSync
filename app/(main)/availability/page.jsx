import { getUserAvailability } from '@/actions/availability'
import React from 'react'
import { defaultAvailability } from './data';
import AvailabilityForm from '@/components/availability-form';

const AvailabilityPage = async () => {

  const availability = await getUserAvailability(); 
  console.log(availability)

  return (
    <AvailabilityForm initialData={availability || defaultAvailability} />
  )
}

export default AvailabilityPage
