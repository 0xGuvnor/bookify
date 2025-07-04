import { BookingContent } from "@/components/booking-content";
import { BookingSkeleton } from "@/components/skeletons/booking-skeleton";
import { getBookingById } from "@/lib/actions/bookings";
import { getEvent } from "@/lib/actions/events";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Booking Confirmation",
  description: "Your booking has been confirmed successfully.",
};

interface Props {
  params: Promise<{
    userId: string;
    eventId: string;
    bookingId: string;
  }>;
}

export default async function BookingPage({ params }: Props) {
  const { userId, eventId, bookingId } = await params;

  // Create promises instead of awaiting them
  const bookingPromise = getBookingById(bookingId);
  const eventPromise = getEvent(userId, eventId);

  return (
    <Suspense fallback={<BookingSkeleton />}>
      <BookingContent
        bookingPromise={bookingPromise}
        eventPromise={eventPromise}
        userId={userId}
        eventId={eventId}
      />
    </Suspense>
  );
}
