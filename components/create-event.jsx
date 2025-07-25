"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import EventForm from "@/components/event-form"

export default function CreateEventDrawer() {
    const [isOpen, setIsOpen] = useState(false)

    const router = useRouter(); 
    const searchParams = useSearchParams()

    useEffect(() => {
      const create = searchParams.get("create")
      if(create == "true") 
        setIsOpen(true)
    }, [searchParams])

    const handleClose = () => {
      setIsOpen(false)
      if(searchParams.get("create") === "true") {
        router.replace(window?.location.pathname)  // redirect to the default page apart from the searchParam
      }
    }

  return (
    <Drawer open={isOpen} onClose={handleClose} >
      <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create New Event</DrawerTitle>
            
          </DrawerHeader>
          <EventForm onSubmitForm = {() => {
            handleClose(); 
          }} />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" onClick={handleClose} >Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
