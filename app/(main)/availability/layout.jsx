import { Suspense } from "react";

export default function AvailabilityLayout({ children }) {
    return (
        <div>
            <Suspense fallback={<div>Loading Availability...</div>} >{children}</Suspense>
        </div>
    )
}