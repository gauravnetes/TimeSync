import Testimonials from "@/components/testimonials";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, Clock, LinkIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: Calendar,
    title: "Create Events",
    description: "Easily set up and customize your event types",
  },
  {
    icon: Clock,
    title: "Manage Availability",
    description: "Define your availability to streamline scheduling",
  },
  {
    icon: LinkIcon,
    title: "Custom Links",
    description: "Share your personalized scheduling link",
  },
];

const howItWorks = [
  { step: "Sign Up", description: "Create your free Schedulrr account" },
  {
    step: "Set Availability",
    description: "Define when you're available for meetings",
  },
  {
    step: "Share Your Link",
    description: "Send your scheduling link to clients or colleagues",
  },
  {
    step: "Get Booked",
    description: "Receive confirmations for new appointments automatically",
  },
];


export default function Home() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-24">
        <div className="lg:w-1/2">
          {/* Heading */}
          <h1 className="text-6xl font-extrabold pb-6 gradient-title">Simplify Your Day to Day Time Scheduling</h1>
          {/* description */}
          <p className="text-xl text-gray-600 mb-10">
            TimeSync helps you to "Sync" your time as per your schedule, Create Events and everything you need to do to be productive without getting lost.
            Sign Up today and let others know your availability!
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="text-md">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="lg:w-1/2 flex justify-center">
          {/* poster */}
          <div className="relative w-full max-w-md aspect-square">
            <Image
              src="/poster.png"
              alt="scheduling poster"
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>
      </div>

      <div className="mb-24">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-700">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
          return (
            <Card key={index}>
              <CardHeader>
                <feature.icon className="w-12 h-12 text-blue-600 mb-4 mx-auto"/>
                <CardTitle
                className="text-center text-blue-600">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          )
        })}
        </div>
      </div>

      <div className="mb-24">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-700">What our Users Say</h2>
        <TestimonialCarousel />
      </div>

      <div className="mb-24">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-700">How it Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {howItWorks.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">{index + 1}</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.step}</h3>
              <h3 className="text-gray-600">{step.description}</h3>
            </div> 
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-700 to-blue-400 rounded-lg text-white p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Simplify your "Time-Sync"?</h2>
        <p className="text-xl mb-6">
          Join the community who made TimeSync the day-to-day part of their life 
        </p>

        <Link href="/dashboard">
          <Button size='lg' variant='secondary' className="text-blue-600">
            Start for Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </main>
  );
}
