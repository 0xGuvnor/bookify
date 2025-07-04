import type {
  Booking,
  Event,
  Schedule,
  ScheduleAvailability,
} from "@/lib/db/schema";
import type { TimeRangeData } from "@/lib/validations";

// Base action result interface
interface BaseActionResult {
  success: boolean;
  message?: string;
}

// Generic result for operations that can have validation errors
interface ActionResultWithErrors extends BaseActionResult {
  errors?: Record<string, string[]>;
}

// Generic result for operations that return data
interface ActionResultWithData<T> extends BaseActionResult {
  data?: T;
}

// Generic result for operations that can have validation errors AND return data
interface ActionResultWithErrorsAndData<T> extends BaseActionResult {
  errors?: Record<string, string[]>;
  data?: T;
}

// Specific result types using the generic bases
export type CreateEventResult = ActionResultWithErrors;
export type UpdateEventResult = ActionResultWithErrors;
export type DeleteEventResult = BaseActionResult;

export type GetEventsResult = ActionResultWithData<Event[]>;
export type GetEventResult = ActionResultWithData<Event>;

export type GetScheduleResult = ActionResultWithData<
  Schedule & {
    availabilities: ScheduleAvailability[];
  }
>;

export type CreateScheduleResult = ActionResultWithErrorsAndData<
  Schedule & {
    availabilities: ScheduleAvailability[];
  }
>;

export type UpdateScheduleResult = ActionResultWithErrorsAndData<
  Schedule & {
    availabilities: ScheduleAvailability[];
  }
>;

export type GetAvailabilitiesResult = ActionResultWithData<TimeRangeData[]>;

// Export the base types for potential reuse in other parts of the app
export type {
  ActionResultWithData,
  ActionResultWithErrors,
  ActionResultWithErrorsAndData,
  BaseActionResult,
};

// Google Calendar types
export interface CalendarEvent {
  id: string | null | undefined;
  summary: string;
  description: string | null;
  start: string | null | undefined;
  end: string | null | undefined;
  location: string | null;
  attendees: Array<{
    email: string | null | undefined;
    displayName: string | null | undefined;
    responseStatus: string | null | undefined;
  }>;
  status: string | null | undefined;
  htmlLink: string | null | undefined;
  created: string | null | undefined;
  updated: string | null | undefined;
}

export type GetCalendarEventTimesResult = ActionResultWithData<CalendarEvent[]>;

// Calendar event creation result type
export type CreateCalendarEventResult = ActionResultWithData<{
  eventId: string;
  htmlLink: string;
}>;

// Booking result types
export type CreateBookingResult = ActionResultWithErrorsAndData<Booking>;
export type UpdateBookingResult = ActionResultWithErrorsAndData<Booking>;
export type DeleteBookingResult = BaseActionResult;
export type GetBookingsResult = ActionResultWithData<Booking[]>;
export type GetBookingResult = ActionResultWithData<Booking>;

// Available time slots result type
export type GetAvailableTimeSlotsResult = ActionResultWithData<string[]>;

// Available dates result type
export type GetAvailableDatesResult = ActionResultWithData<Date[]>;
