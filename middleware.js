import { RedirectToSignIn } from '@clerk/nextjs';
import { clerkMiddleware, createRouteMatcher, getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// while accessing the routes the auth route shows up to 
// make users authorized 
const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)", 
    "/events(.*)", 
    "/meetings(.*)", 
    "/availability(.*)", 
]) 

export default clerkMiddleware( async (auth, req) => {
    if(isProtectedRoute(req)) await auth.protect()
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};