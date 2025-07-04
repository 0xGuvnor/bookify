"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GetBookingResult, GetEventResult } from "@/lib/types";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  MapPin,
  User,
  Video,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

interface BookingContentProps {
  bookingPromise: Promise<GetBookingResult>;
  eventPromise: Promise<GetEventResult>;
  userId: string;
  eventId: string;
}

export function BookingContent({
  bookingPromise,
  eventPromise,
  userId,
  eventId,
}: BookingContentProps) {
  const bookingResult = use(bookingPromise);
  const eventResult = use(eventPromise);

  if (!bookingResult.success || !bookingResult.data) {
    notFound();
  }

  if (!eventResult.success || !eventResult.data) {
    notFound();
  }

  const booking = bookingResult.data;
  const event = eventResult.data;

  // Format booking times
  const startTime = toZonedTime(booking.startTime, "UTC");
  const endTime = toZonedTime(booking.endTime, "UTC");
  const bookingDate = format(startTime, "EEEE, MMMM do, yyyy");
  const bookingTimeRange = `${format(startTime, "h:mm a")} - ${format(endTime, "h:mm a")}`;

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "cancelled":
        return "destructive";
      case "completed":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Booking Confirmed! 🎉
          </h1>
          <p className="text-gray-600">
            Your booking has been confirmed successfully. You'll receive a
            confirmation email shortly with all the details.
          </p>
        </div>

        {/* Booking Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Booking Details
              </CardTitle>
              <Badge variant={getStatusVariant(booking.status)}>
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Event Information */}
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-3 font-semibold text-gray-900">Event</h3>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    {event.title}
                  </p>
                  {event.description && (
                    <p className="text-gray-600">{event.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {event.duration} minutes
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-gray-900">{booking.bookerName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{booking.bookerEmail}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarIcon className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="text-gray-900">{bookingDate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Time</p>
                    <p className="text-gray-900">{bookingTimeRange}</p>
                  </div>
                </div>

                {/* Location */}
                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Location
                      </p>
                      <p className="text-gray-900">{event.location}</p>
                    </div>
                  </div>
                )}

                {/* Meeting Link */}
                {event.meetingLink && (
                  <div className="flex items-start gap-3">
                    <Video className="mt-0.5 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Meeting Link
                      </p>
                      <a
                        href={event.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Join Meeting
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {booking.bookerNotes && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-500">
                        Additional Notes
                      </p>
                      <p className="text-gray-700">{booking.bookerNotes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking ID */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Booking ID
                    </p>
                    <p className="font-mono text-sm text-gray-900">
                      {booking.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-sm text-gray-900">
                      {format(
                        new Date(booking.createdAt),
                        "MMM d, yyyy 'at' h:mm a",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="outline">
            <Link href={`/book/${userId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/book/${userId}/${eventId}`}>Book Another Time</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
