
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { PenBox } from 'lucide-react'
import {  SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import UserMenu from './user-menu'
import { checkUser } from '@/lib/checkUser'

const Header = async () => {
    await checkUser(); 
    return (
        <nav className='mx-auto py-0 px-4 flex justify-between items-center shadow-md border-b-1 bg-white'>
            <Link href="/" className='flex items-center'>
                <Image
                    src="/logo.png"
                    width={150}
                    height={60}
                    alt='TimeSync Logo'
                    className='h-25 w-auto'
                />
            </Link>

            <div className='flex items-center gap-4'>
                <Link
                    href="/events?create=true"
                >
                    <Button className="flex items-center gap-2">
                        <PenBox size={18} />
                        Create Event
                    </Button>
                </Link>

                <SignedOut>
                    <SignInButton forceRedirectUrl="/dashboard">
                        <Button variant="outline">
                            Log in
                        </Button>
                    </SignInButton>
                </SignedOut>

                <SignedIn>
                    <UserMenu />
                </SignedIn>
            </div>
        </nav>
    )
}

export default Header
