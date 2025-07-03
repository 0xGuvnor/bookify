import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarIcon, HomeIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-[70vh] items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Fun 404 Animation */}
        <div className="mb-8">
          <div className="relative">
            <h1 className="animate-pulse text-[120px] font-bold text-blue-200 select-none">
              404
            </h1>
            <CalendarIcon className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 transform animate-bounce text-blue-400" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            User Not Found
          </h2>
          <p className="leading-relaxed text-gray-600">
            The user you&apos;re looking for doesn&apos;t exist or their booking
            page is no longer available.
          </p>
        </div>

        {/* Navigation Actions */}
        <div className="mt-8 space-y-3">
          <Link href="/" className="block">
            <Button className="w-full" size="lg">
              <HomeIcon className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </Link>

          <Link href="/events" className="block">
            <Button variant="outline" className="w-full" size="lg">
              <CalendarIcon className="mr-2 h-4 w-4" />
              View My Events
            </Button>
          </Link>
        </div>

        {/* Brand Touch */}
        <div className="mt-12 text-sm text-gray-500">
          <p>Need help? Contact Bookify support</p>
        </div>
      </div>
    </div>
  );
}
