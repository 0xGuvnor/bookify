import type { Event, Schedule, ScheduleAvailability } from "@/lib/db/schema";

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

export type GetEventResult = {
  success: boolean;
  message?: string;
  event?: Event;
};

export type GetScheduleResult = {
  success: boolean;
  message?: string;
  schedule?: Schedule & {
    availabilities: ScheduleAvailability[];
  };
};

export type CreateScheduleResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  schedule?: Schedule & {
    availabilities: ScheduleAvailability[];
  };
};

export type UpdateScheduleResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  schedule?: Schedule & {
    availabilities: ScheduleAvailability[];
  };
};
