import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import CreateEventDrawer from "@/components/create-event";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TimeSync",
  description: "Scheduling Application",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Header />
          <main className="min-h-screen bg-gradient-to-b from-blue-50">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-blue-100 py-10">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Developed by @gauravnetes</p>
            </div>
          </footer>
          <Suspense fallback={null} >
            <CreateEventDrawer />
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}
