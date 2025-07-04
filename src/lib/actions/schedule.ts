"use server";

import { db } from "@/lib/db";
import {
  scheduleAvailabilitiesTable,
  schedulesTable,
  type DayOfWeek,
} from "@/lib/db/schema";
import type {
  CreateScheduleResult,
  GetAvailabilitiesResult,
  GetScheduleResult,
  UpdateScheduleResult,
} from "@/lib/types";
import {
  scheduleFormSchema,
  type ScheduleFormData,
  type TimeRangeData,
} from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";
import {
  addMinutes,
  areIntervalsOverlapping,
  differenceInMinutes,
  format as formatDateFns,
  getHours,
  getMinutes,
  isValid,
  parse,
} from "date-fns";
import { format } from "date-fns-tz";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getSchedule(userId: string): Promise<GetScheduleResult> {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required to fetch the schedule.",
      };
    }

    // Get the user's schedule with availabilities
    const schedule = await db
      .select()
      .from(schedulesTable)
      .where(eq(schedulesTable.clerkUserId, userId))
      .limit(1);

    // If no schedule exists yet, return success with undefined schedule
    if (schedule.length === 0) {
      return {
        success: true,
        message: "No schedule found. You can create one to get started!",
        data: undefined,
      };
    }

    // Get availabilities for this schedule
    const availabilities = await db
      .select()
      .from(scheduleAvailabilitiesTable)
      .where(eq(scheduleAvailabilitiesTable.scheduleId, schedule[0].id))
      .orderBy(
        scheduleAvailabilitiesTable.dayOfWeek,
        scheduleAvailabilitiesTable.startTime,
      );

    // Return success with schedule and availabilities
    return {
      success: true,
      data: {
        ...schedule[0],
        availabilities,
      },
    };
  } catch (error) {
    console.error("Failed to get schedule:", error);
    return {
      success: false,
      message:
        "Something went wrong while fetching your schedule. Please try again.",
    };
  }
}

export async function createSchedule(
  data: ScheduleFormData,
): Promise<CreateScheduleResult> {
  try {
    // Get the current user
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to create a schedule.",
      };
    }

    // Validate the data using our Zod schema
    const validatedFields = scheduleFormSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Please check your form data and try again.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { timezone, availabilities } = validatedFields.data;

    // Check if user already has a schedule
    const existingSchedule = await db
      .select()
      .from(schedulesTable)
      .where(eq(schedulesTable.clerkUserId, userId))
      .limit(1);

    if (existingSchedule.length > 0) {
      return {
        success: false,
        message: "You already have a schedule. Use update instead.",
      };
    }

    // Create the schedule
    const [newSchedule] = await db
      .insert(schedulesTable)
      .values({
        clerkUserId: userId,
        timezone,
      })
      .returning();

    // Create availabilities
    if (availabilities.length > 0) {
      await db.insert(scheduleAvailabilitiesTable).values(
        availabilities.map((availability) => ({
          scheduleId: newSchedule.id,
          dayOfWeek: availability.dayOfWeek as
            | "sunday"
            | "monday"
            | "tuesday"
            | "wednesday"
            | "thursday"
            | "friday"
            | "saturday",
          startTime: availability.startTime,
          endTime: availability.endTime,
        })),
      );
    }

    // Get the complete schedule with availabilities
    const createdAvailabilities = await db
      .select()
      .from(scheduleAvailabilitiesTable)
      .where(eq(scheduleAvailabilitiesTable.scheduleId, newSchedule.id))
      .orderBy(
        scheduleAvailabilitiesTable.dayOfWeek,
        scheduleAvailabilitiesTable.startTime,
      );

    // Revalidate the schedule page
    revalidatePath("/schedule");

    return {
      success: true,
      message: "Schedule created successfully!",
      data: {
        ...newSchedule,
        availabilities: createdAvailabilities,
      },
    };
  } catch (error) {
    console.error("Failed to create schedule:", error);
    return {
      success: false,
      message:
        "Something went wrong while creating your schedule. Please try again.",
    };
  }
}

export async function updateSchedule(
  data: ScheduleFormData,
): Promise<UpdateScheduleResult> {
  try {
    // Get the current user
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to update a schedule.",
      };
    }

    // Validate the data using our Zod schema
    const validatedFields = scheduleFormSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Please check your form data and try again.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { timezone, availabilities } = validatedFields.data;

    // Check if user has a schedule
    const existingSchedule = await db
      .select()
      .from(schedulesTable)
      .where(eq(schedulesTable.clerkUserId, userId))
      .limit(1);

    if (existingSchedule.length === 0) {
      return {
        success: false,
        message: "No schedule found. Create one first.",
      };
    }

    const schedule = existingSchedule[0];

    // Update the schedule
    const [updatedSchedule] = await db
      .update(schedulesTable)
      .set({
        timezone,
      })
      .where(eq(schedulesTable.id, schedule.id))
      .returning();

    // Delete existing availabilities
    await db
      .delete(scheduleAvailabilitiesTable)
      .where(eq(scheduleAvailabilitiesTable.scheduleId, schedule.id));

    // Create new availabilities
    if (availabilities.length > 0) {
      await db.insert(scheduleAvailabilitiesTable).values(
        availabilities.map((availability) => ({
          scheduleId: schedule.id,
          dayOfWeek: availability.dayOfWeek as
            | "sunday"
            | "monday"
            | "tuesday"
            | "wednesday"
            | "thursday"
            | "friday"
            | "saturday",
          startTime: availability.startTime,
          endTime: availability.endTime,
        })),
      );
    }

    // Get the complete updated schedule with availabilities
    const updatedAvailabilities = await db
      .select()
      .from(scheduleAvailabilitiesTable)
      .where(eq(scheduleAvailabilitiesTable.scheduleId, schedule.id))
      .orderBy(
        scheduleAvailabilitiesTable.dayOfWeek,
        scheduleAvailabilitiesTable.startTime,
      );

    // Revalidate the schedule page
    revalidatePath("/schedule");

    return {
      success: true,
      message: "Schedule updated successfully!",
      data: {
        ...updatedSchedule,
        availabilities: updatedAvailabilities,
      },
    };
  } catch (error) {
    console.error("Failed to update schedule:", error);
    return {
      success: false,
      message:
        "Something went wrong while updating your schedule. Please try again.",
    };
  }
}

export async function getValidTimesFromSchedule(
  timesInOrder: Date[],
  event: { clerkUserId: string; durationInMinutes: number },
): Promise<Date[]> {
  try {
    // Early return if no time slots to check
    if (timesInOrder.length === 0) {
      return [];
    }

    // Get the user's schedule
    const scheduleResult = await getSchedule(event.clerkUserId);

    if (!scheduleResult.success || !scheduleResult.data) {
      return []; // No schedule means no available times
    }

    const schedule = scheduleResult.data;

    // Get the date range for calendar events
    // Check from the first time slot to the last time slot + event duration
    const startDate = timesInOrder[0];
    const lastSlot = timesInOrder.at(-1)!;
    const endDate = addMinutes(lastSlot, event.durationInMinutes);

    // Get calendar events for the date range
    const { getCalendarEventTimes } = await import("./google-calendar");
    const calendarResult = await getCalendarEventTimes(event.clerkUserId, {
      start: startDate,
      end: endDate,
    });

    const calendarEvents = calendarResult.success
      ? calendarResult.data || []
      : [];

    // Filter time slots based on availability and calendar conflicts
    const validTimes = timesInOrder.filter((timeSlot) => {
      // Check if this time slot matches the user's availability
      const dayOfWeek = getDayOfWeek(timeSlot);
      const timeOfDay = getTimeOfDay(timeSlot);

      // Find availability for this day
      const dayAvailability = schedule.availabilities.filter(
        (availability) => availability.dayOfWeek === dayOfWeek,
      );

      // If no availability for this day, skip this time slot
      if (dayAvailability.length === 0) {
        return false;
      }

      // Check if the time slot falls within any availability window
      // and if the entire event duration fits within the window
      const eventEndTime = addMinutes(timeSlot, event.durationInMinutes);
      const eventEndTimeOfDay = getTimeOfDay(eventEndTime);

      const isWithinAvailability = dayAvailability.some((availability) => {
        const startTime = parseTime(availability.startTime);
        const endTime = parseTime(availability.endTime);

        // Both start and end of the event must be within the availability window
        return (
          timeOfDay >= startTime &&
          eventEndTimeOfDay <= endTime &&
          timeOfDay < eventEndTimeOfDay
        ); // Ensure the event has positive duration
      });

      if (!isWithinAvailability) {
        return false;
      }

      // Check for calendar conflicts using date-fns interval overlap detection
      const hasConflict = calendarEvents.some((calendarEvent) => {
        // Skip events without proper start/end times
        if (!calendarEvent.start || !calendarEvent.end) {
          return false;
        }

        const calendarStart = new Date(calendarEvent.start);
        const calendarEnd = new Date(calendarEvent.end);

        // Check if the proposed event overlaps with this calendar event
        return areIntervalsOverlapping(
          { start: timeSlot, end: eventEndTime },
          { start: calendarStart, end: calendarEnd },
        );
      });

      return !hasConflict;
    });

    return validTimes;
  } catch (error) {
    console.error("Failed to get valid times from schedule:", error);
    return [];
  }
}

// Helper functions for time handling
function getDayOfWeek(date: Date): DayOfWeek {
  return formatDateFns(date, "EEEE").toLowerCase() as DayOfWeek;
}

function getTimeOfDay(date: Date): number {
  return getHours(date) * 60 + getMinutes(date);
}

function parseTime(timeString: string): number {
  // Parse the time string using date-fns for more robust handling
  const parsedTime = parse(timeString, "HH:mm", new Date());

  // If parsing fails, fall back to manual parsing
  if (!isValid(parsedTime)) {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  }

  return getHours(parsedTime) * 60 + getMinutes(parsedTime);
}

// Helper function to create a Date object from time string for comparison
function createTimeDate(timeString: string): Date {
  const parsedTime = parse(timeString, "HH:mm", new Date());
  return isValid(parsedTime) ? parsedTime : new Date();
}

// Helper function to check if a time range is valid
function isValidTimeRange(startTime: string, endTime: string): boolean {
  const start = createTimeDate(startTime);
  const end = createTimeDate(endTime);
  return isValid(start) && isValid(end) && differenceInMinutes(end, start) > 0;
}

export async function getAvailabilities(
  groupedAvailabilities: Record<DayOfWeek, TimeRangeData[]>,
  date: Date,
  timezone: string,
): Promise<GetAvailabilitiesResult> {
  try {
    if (!date) {
      return {
        success: false,
        message: "Date is required to get availabilities.",
      };
    }

    if (!timezone) {
      return {
        success: false,
        message: "Timezone is required to get availabilities.",
      };
    }

    // Get the day of the week for the given date using date-fns-tz for accurate timezone handling
    const dayOfWeek = format(date, "EEEE", {
      timeZone: timezone,
    }).toLowerCase() as DayOfWeek;

    // Get availabilities for this specific day
    const dayAvailabilities = groupedAvailabilities[dayOfWeek] || [];

    // Sort availabilities by start time for consistent ordering using date-fns
    const sortedAvailabilities = dayAvailabilities
      .filter((availability) =>
        isValidTimeRange(availability.startTime, availability.endTime),
      )
      .sort((a: TimeRangeData, b: TimeRangeData) => {
        const aStart = createTimeDate(a.startTime);
        const bStart = createTimeDate(b.startTime);
        return differenceInMinutes(aStart, bStart);
      });

    return {
      success: true,
      data: sortedAvailabilities,
    };
  } catch (error) {
    console.error("Failed to get availabilities:", error);
    return {
      success: false,
      message:
        "Something went wrong while getting availabilities. Please try again.",
    };
  }
}
