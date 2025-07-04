"use client";

import { use } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Link2, Calendar } from "lucide-react";
import type { GetEventsResult } from "@/lib/types";

interface Props {
  eventsPromise: Promise<GetEventsResult>;
  userName: string;
}

function PublicEventsList({ eventsPromise, userName }: Props) {
  const result = use(eventsPromise);

  if (!result.success) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          Unable to load events. Please try again later.
        </p>
      </div>
    );
  }

  const events = result.data || [];

  if (events.length === 0) {
    return (
      <div className="py-8 text-center">
        <Calendar className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">No Events Available</h3>
        <p className="text-muted-foreground">
          {userName} hasn&apos;t published any events for booking yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Available Events</h3>
        <p className="text-muted-foreground">
          Choose an event to book with {userName}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => {
          const participants = JSON.parse(
            event.participants || "[]",
          ) as string[];

          return (
            <Card
              key={event.id}
              className="hover:border-primary/20 relative overflow-hidden border transition-all duration-200 hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="text-lg font-semibold">{event.title}</h4>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      Active
                    </Badge>
                  </div>

                  <div className="text-muted-foreground mb-3 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {event.duration} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {participants.length} participant
                      {participants.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    {event.location && (
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="text-muted-foreground h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {event.meetingLink && (
                      <div className="flex items-center gap-1 text-sm">
                        <Link2 className="text-muted-foreground h-4 w-4" />
                        <a
                          href={event.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Meeting Link
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      // TODO: Navigate to booking page for this specific event
                      console.log(`Booking event ${event.id}`);
                    }}
                  >
                    Book Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default PublicEventsList;
