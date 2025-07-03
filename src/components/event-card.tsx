"use client";

import { use } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
} from "lucide-react";
import type { GetEventsResult } from "@/lib/types";
import Link from "next/link";

interface Props {
  eventsPromise: Promise<GetEventsResult>;
}

function EventCard({ eventsPromise }: Props) {
  const result = use(eventsPromise);

  if (!result.success || !result.events) {
    return (
      <div className="py-8 text-center">
        <p className="text-lg text-gray-500">
          {result.message || "Failed to load events"}
        </p>
      </div>
    );
  }

  if (result.events.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-6xl">📅</div>
        <h3 className="mb-2 text-xl font-semibold text-gray-700">
          No events yet
        </h3>
        <p className="mb-6 text-gray-500">
          Create your first event to get started!
        </p>
        <Button asChild className="gradient-button">
          <Link href="/events/new">Create Your First Event</Link>
        </Button>
      </div>
    );
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const getParticipants = (participantsJson: string): string[] => {
    try {
      return JSON.parse(participantsJson) as string[];
    } catch {
      return [];
    }
  };

  const getLocationType = (
    location?: string | null,
    meetingLink?: string | null,
  ): "in-person" | "video" | "phone" => {
    if (meetingLink) return "video";
    if (location) return "in-person";
    return "phone";
  };

  const statusIndicatorColors = {
    active: "bg-green-500",
    inactive: "bg-gray-400",
  };

  const statusBgColors = {
    active:
      "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
    inactive:
      "bg-gray-50 border-gray-200 dark:bg-gray-950/30 dark:border-gray-800",
  };

  const statusColors = {
    active:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    inactive:
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800",
  };

  const locationIcons = {
    "in-person": MapPin,
    video: Video,
    phone: Phone,
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {result.events.map((event) => {
        const locationType = getLocationType(event.location, event.meetingLink);
        const LocationIcon = locationIcons[locationType];
        const participants = getParticipants(event.participants);
        const status = event.isActive ? "active" : "inactive";

        return (
          <Card
            key={event.id}
            className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${statusBgColors[status]} border`}
          >
            {/* Color indicator bar */}
            <div
              className={`absolute top-0 left-0 h-full w-1 ${statusIndicatorColors[status]}`}
            />

            <CardContent className="p-6 pl-8">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="line-clamp-1 text-lg leading-tight font-semibold text-gray-900 dark:text-gray-100">
                      {event.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${statusColors[status]}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>

                  <div className="mb-3 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">
                        {new Date(event.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(event.duration)}</span>
                    </div>
                  </div>

                  {event.description && (
                    <p className="mb-3 line-clamp-2 text-left text-sm text-gray-600 dark:text-gray-400">
                      {event.description}
                    </p>
                  )}

                  {(event.location || event.meetingLink) && (
                    <div className="mb-4 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <LocationIcon className="h-4 w-4" />
                      <span className="truncate">
                        {event.location || "Online meeting"}
                      </span>
                    </div>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/events/${event.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Event
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/book?event=${event.id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Booking Page
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            `${window.location.origin}/book?event=${event.id}`,
                          );
                          toast.success(
                            "Booking link copied to clipboard! 📋",
                            {
                              description:
                                "Share this link with your attendees to let them book this event.",
                            },
                          );
                        } catch {
                          toast.error("Failed to copy link 😅", {
                            description:
                              "Please try again or copy the URL manually.",
                          });
                        }
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 dark:text-red-400">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div className="flex -space-x-2">
                    {participants.slice(0, 3).map((email, index) => {
                      const initials = email
                        .split("@")[0]
                        .split(".")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);

                      return (
                        <Avatar
                          key={index}
                          className="h-6 w-6 border-2 border-white dark:border-gray-800"
                        >
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xs text-white">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      );
                    })}
                    {participants.length > 3 && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          +{participants.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="ml-1 text-sm text-gray-500">
                    {participants.length}{" "}
                    {participants.length === 1 ? "attendee" : "attendees"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default EventCard;
