import { Suspense } from "react";
import EventCard from "./event-card";
import EventSkeleton from "./event-skeleton";
import type { GetEventsResult } from "@/lib/types";

interface Props {
  eventsPromise: Promise<GetEventsResult>;
}

function EventsList({ eventsPromise }: Props) {
  return (
    <div className="mt-12">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Your Events</h2>
        <p className="text-gray-600">
          Manage and organize all your scheduled events
        </p>
      </div>

      <Suspense fallback={<EventSkeleton />}>
        <EventCard eventsPromise={eventsPromise} />
      </Suspense>
    </div>
  );
}

export default EventsList;
