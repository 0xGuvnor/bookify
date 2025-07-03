import type { Event, Schedule, ScheduleAvailability } from "@/lib/db/schema";

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

// Export the base types for potential reuse in other parts of the app
export type {
  BaseActionResult,
  ActionResultWithErrors,
  ActionResultWithData,
  ActionResultWithErrorsAndData,
};
