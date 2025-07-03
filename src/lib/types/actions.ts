import type { Event } from "@/lib/db/schema";

export type CreateEventResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export type UpdateEventResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export type DeleteEventResult = {
  success: boolean;
  message?: string;
};

export type GetEventsResult = {
  success: boolean;
  message?: string;
  events?: Event[];
};
