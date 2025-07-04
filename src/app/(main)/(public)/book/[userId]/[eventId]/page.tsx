import BookingForm from "@/components/forms/booking-form";
import { getEvent } from "@/lib/actions/events";
import { getSchedule } from "@/lib/actions/schedule";

interface Props {
  params: Promise<{
    userId: string;
    eventId: string;
  }>;
}

async function BookEventPage({ params }: Props) {
  const { userId, eventId } = await params;

  const [eventResult, scheduleResult] = await Promise.all([
    getEvent(userId, eventId),
    getSchedule(userId),
  ]);

  // Handle case where event doesn't exist or result is not successful
  if (!eventResult.success || !eventResult.data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Event Not Found
          </h1>
          <p className="text-gray-600">
            Sorry, this event does not exist anymore or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const event = eventResult.data;

  // Get timezone from user's schedule, fallback to UTC
  const timezone =
    scheduleResult.success && scheduleResult.data
      ? scheduleResult.data.timezone
      : "UTC";

  return (
    <div className="px-4 pb-12">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-white/20 bg-white/90 p-8 shadow-xl backdrop-blur-sm">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">
            {event.title}
          </h1>

          {event.description && (
            <div className="mb-8">
              <p className="leading-relaxed text-gray-600">
                {event.description}
              </p>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700">Duration:</span>
              <span className="text-gray-600">{event.duration} minutes</span>
            </div>

            {event.location && (
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-700">Location:</span>
                <span className="text-gray-600">{event.location}</span>
              </div>
            )}

            {event.meetingLink && (
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-700">
                  Meeting Link:
                </span>
                <a
                  href={event.meetingLink}
                  className="text-blue-600 underline transition-colors hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {event.meetingLink}
                </a>
              </div>
            )}
          </div>

          {/* Booking Form */}
          <div className="mt-10">
            <BookingForm
              event={event}
              eventOwnerId={userId}
              timezone={timezone}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookEventPage;
