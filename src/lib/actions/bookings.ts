"use server";

import { db } from "@/lib/db";
import type {
  DayOfWeek,
  Schedule,
  ScheduleAvailability,
} from "@/lib/db/schema";
import { bookingsTable } from "@/lib/db/schema";
import type {
  CalendarEvent,
  CreateBookingResult,
  DeleteBookingResult,
  GetAvailableDatesResult,
  GetAvailableTimeSlotsResult,
  GetBookingResult,
  GetBookingsResult,
  UpdateBookingResult,
} from "@/lib/types";
import { isValidUUID } from "@/lib/utils";
import {
  createBookingSchema,
  updateBookingSchema,
  type BookingFormData,
  type CreateBookingData,
  type UpdateBookingData,
} from "@/lib/validations";
import {
  addMinutes,
  areIntervalsOverlapping,
  eachDayOfInterval,
  endOfDay,
  format,
  format as formatDateFns,
  getHours,
  getMinutes,
  parse,
  startOfDay,
} from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getEvent } from "./events";
import { createCalendarEvent } from "./google-calendar";
import { getSchedule, getValidTimesFromSchedule } from "./schedule";

// Optimized version of getValidTimesFromSchedule that accepts calendar events
async function getValidTimesFromScheduleWithCalendarEvents(
  timesInOrder: Date[],
  event: { clerkUserId: string; durationInMinutes: number },
  schedule: Schedule & { availabilities: ScheduleAvailability[] },
  calendarEvents: CalendarEvent[],
): Promise<Date[]> {
  try {
    // Early return if no time slots to check
    if (timesInOrder.length === 0) {
      return [];
    }

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
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

export async function createBooking(
  eventId: string,
  eventOwnerId: string,
  formData: BookingFormData,
): Promise<CreateBookingResult> {
  try {
    // Validate the event exists and is active
    const eventResult = await getEvent(eventOwnerId, eventId);
    if (!eventResult.success || !eventResult.data) {
      return {
        success: false,
        message: "Event not found or is not available for booking.",
      };
    }

    const event = eventResult.data;
    if (!event.isActive) {
      return {
        success: false,
        message: "This event is not currently available for booking.",
      };
    }

    // Prepare the data for validation
    const createData: CreateBookingData = {
      ...formData,
      eventId,
      eventOwnerId,
      duration: event.duration,
    };

    // Validate the data using our Zod schema
    const validatedFields = createBookingSchema.safeParse(createData);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Please check your form data and try again.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const {
      bookerName,
      bookerEmail,
      bookerNotes,
      selectedDate,
      selectedTime,
      timezone,
    } = validatedFields.data;

    // Parse the selected date and time
    const bookingDate = parse(selectedDate, "yyyy-MM-dd", new Date());
    const [hours, minutes] = selectedTime.split(":").map(Number);

    // Create the start time in the user's timezone
    const startTimeInTimezone = new Date(bookingDate);
    startTimeInTimezone.setHours(hours, minutes, 0, 0);

    // Convert to UTC for storage
    const startTimeUTC = fromZonedTime(startTimeInTimezone, timezone);
    const endTimeUTC = addMinutes(startTimeUTC, event.duration);

    // Check if the selected time is still available
    const isAvailable = await isTimeSlotAvailable(
      eventOwnerId,
      startTimeUTC,
      endTimeUTC,
    );

    if (!isAvailable) {
      return {
        success: false,
        message:
          "The selected time slot is no longer available. Please choose a different time.",
      };
    }

    // Helper function to convert empty strings to null
    const emptyToNull = (value: string | undefined) =>
      !value || value.trim() === "" ? null : value;

    // Insert booking into database
    const [newBooking] = await db
      .insert(bookingsTable)
      .values({
        eventId,
        eventOwnerId,
        bookerName,
        bookerEmail,
        bookerNotes: emptyToNull(bookerNotes),
        startTime: startTimeUTC,
        endTime: endTimeUTC,
        status: "confirmed",
      })
      .returning();

    // Create Google Calendar event with invites
    try {
      const calendarEventResult = await createCalendarEvent(eventOwnerId, {
        title: event.title,
        description: `Booking with ${bookerName}${bookerNotes ? `\n\nNotes: ${bookerNotes}` : ""}`,
        startTime: startTimeUTC,
        endTime: endTimeUTC,
        attendeeEmails: [bookerEmail],
        location: event.location || undefined,
        meetingLink: event.meetingLink || undefined,
      });

      if (calendarEventResult.success && calendarEventResult.data) {
        // Update the booking with the Google Calendar event ID
        await db
          .update(bookingsTable)
          .set({
            googleCalendarEventId: calendarEventResult.data.eventId,
          })
          .where(eq(bookingsTable.id, newBooking.id));
      } else {
        console.warn(
          "Failed to create calendar event:",
          calendarEventResult.message,
        );
        // Don't fail the booking if calendar event creation fails
      }
    } catch (error) {
      console.error("Error creating calendar event:", error);
      // Don't fail the booking if calendar event creation fails
    }

    // Revalidate relevant paths
    revalidatePath(`/book/${eventOwnerId}/${eventId}`);
    revalidatePath(`/book/${eventOwnerId}`);

    return {
      success: true,
      message:
        "Booking created successfully! You'll receive a confirmation email shortly.",
      data: newBooking,
    };
  } catch (error) {
    console.error("Failed to create booking:", error);
    return {
      success: false,
      message:
        "Something went wrong while creating your booking. Please try again.",
    };
  }
}

export async function updateBooking(
  bookingId: string,
  data: UpdateBookingData,
): Promise<UpdateBookingResult> {
  try {
    // Validate UUID format before proceeding
    if (!isValidUUID(bookingId)) {
      return {
        success: false,
        message: "Invalid booking ID.",
      };
    }

    // Validate the data using our Zod schema
    const validatedFields = updateBookingSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Please check your form data and try again.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { status, bookerNotes } = validatedFields.data;

    // Check if booking exists
    const existingBooking = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, bookingId))
      .limit(1);

    if (existingBooking.length === 0) {
      return {
        success: false,
        message: "Booking not found.",
      };
    }

    // Helper function to convert empty strings to null
    const emptyToNull = (value: string | undefined) =>
      !value || value.trim() === "" ? null : value;

    // Update the booking
    const [updatedBooking] = await db
      .update(bookingsTable)
      .set({
        status,
        bookerNotes: emptyToNull(bookerNotes),
      })
      .where(eq(bookingsTable.id, bookingId))
      .returning();

    // Revalidate relevant paths
    revalidatePath(`/book/${existingBooking[0].eventOwnerId}`);

    return {
      success: true,
      message: "Booking updated successfully!",
      data: updatedBooking,
    };
  } catch (error) {
    console.error("Failed to update booking:", error);
    return {
      success: false,
      message:
        "Something went wrong while updating the booking. Please try again.",
    };
  }
}

export async function deleteBooking(
  bookingId: string,
): Promise<DeleteBookingResult> {
  try {
    // Validate UUID format before proceeding
    if (!isValidUUID(bookingId)) {
      return {
        success: false,
        message: "Invalid booking ID.",
      };
    }

    // Check if booking exists
    const existingBooking = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, bookingId))
      .limit(1);

    if (existingBooking.length === 0) {
      return {
        success: false,
        message: "Booking not found.",
      };
    }

    // Delete the booking
    await db.delete(bookingsTable).where(eq(bookingsTable.id, bookingId));

    // Revalidate relevant paths
    revalidatePath(`/book/${existingBooking[0].eventOwnerId}`);

    return {
      success: true,
      message: "Booking cancelled successfully!",
    };
  } catch (error) {
    console.error("Failed to delete booking:", error);
    return {
      success: false,
      message:
        "Something went wrong while cancelling the booking. Please try again.",
    };
  }
}

export async function getBookings(
  eventOwnerId: string,
  eventId?: string,
): Promise<GetBookingsResult> {
  try {
    if (!eventOwnerId) {
      return {
        success: false,
        message: "Event owner ID is required to fetch bookings.",
      };
    }

    // Build the query conditions
    const conditions = [eq(bookingsTable.eventOwnerId, eventOwnerId)];

    if (eventId) {
      if (!isValidUUID(eventId)) {
        return {
          success: false,
          message: "Invalid event ID.",
        };
      }
      conditions.push(eq(bookingsTable.eventId, eventId));
    }

    // Get bookings
    const bookings = await db
      .select()
      .from(bookingsTable)
      .where(and(...conditions))
      .orderBy(desc(bookingsTable.startTime));

    return {
      success: true,
      data: bookings,
    };
  } catch (error) {
    console.error("Failed to get bookings:", error);
    return {
      success: false,
      message:
        "Something went wrong while fetching bookings. Please try again.",
    };
  }
}

export async function getBooking(bookingId: string): Promise<GetBookingResult> {
  try {
    if (!bookingId) {
      return {
        success: false,
        message: "Booking ID is required to fetch the booking.",
      };
    }

    // Validate UUID format before querying database
    if (!isValidUUID(bookingId)) {
      return {
        success: false,
        message: "Invalid booking ID.",
      };
    }

    // Get the booking
    const bookings = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, bookingId))
      .limit(1);

    if (bookings.length === 0) {
      return {
        success: false,
        message: "Booking not found.",
      };
    }

    return {
      success: true,
      data: bookings[0],
    };
  } catch (error) {
    console.error("Failed to get booking:", error);
    return {
      success: false,
      message:
        "Something went wrong while fetching the booking. Please try again.",
    };
  }
}

export async function getAvailableTimeSlots(
  eventOwnerId: string,
  eventId: string,
  date: Date,
  timezone: string,
): Promise<GetAvailableTimeSlotsResult> {
  try {
    // Validate inputs
    if (!eventOwnerId || !eventId || !date || !timezone) {
      return {
        success: false,
        message: "All parameters are required to get available time slots.",
      };
    }

    // Validate UUID format
    if (!isValidUUID(eventId)) {
      return {
        success: false,
        message: "Invalid event ID.",
      };
    }

    // Get the event
    const eventResult = await getEvent(eventOwnerId, eventId);
    if (!eventResult.success || !eventResult.data) {
      return {
        success: false,
        message: "Event not found or is not available.",
      };
    }

    const event = eventResult.data;

    // Generate time slots for the day (every 15 minutes from 6 AM to 11 PM)
    const startOfDayDate = startOfDay(date);
    const endOfDayDate = endOfDay(date);
    const timeSlots: Date[] = [];

    // Start from 6 AM
    let currentTime = new Date(startOfDayDate);
    currentTime.setHours(6, 0, 0, 0);

    // End at 11 PM
    const endTime = new Date(startOfDayDate);
    endTime.setHours(23, 0, 0, 0);

    // Generate 15-minute slots
    while (currentTime <= endTime) {
      timeSlots.push(new Date(currentTime));
      currentTime = addMinutes(currentTime, 15);
    }

    // Convert time slots to user's timezone
    const timeSlotsInTimezone = timeSlots.map((slot) =>
      toZonedTime(slot, timezone),
    );

    // Get valid times based on the user's schedule
    const validTimes = await getValidTimesFromSchedule(timeSlotsInTimezone, {
      clerkUserId: eventOwnerId,
      durationInMinutes: event.duration,
    });

    // Convert back to time strings for the UI
    const availableTimeStrings = validTimes.map((validTime) => {
      const timeInTimezone = toZonedTime(validTime, timezone);
      return format(timeInTimezone, "HH:mm");
    });

    // Remove duplicates and sort
    const uniqueTimeStrings = [...new Set(availableTimeStrings)].sort();

    return {
      success: true,
      data: uniqueTimeStrings,
    };
  } catch (error) {
    console.error("Failed to get available time slots:", error);
    return {
      success: false,
      message:
        "Something went wrong while fetching available time slots. Please try again.",
    };
  }
}

export async function getAvailableDates(
  eventOwnerId: string,
  eventId: string,
  startDate: Date,
  endDate: Date,
  timezone: string,
): Promise<GetAvailableDatesResult> {
  try {
    // Validate inputs
    if (!eventOwnerId || !eventId || !startDate || !endDate || !timezone) {
      return {
        success: false,
        message: "All parameters are required to get available dates.",
      };
    }

    // Validate UUID format
    if (!isValidUUID(eventId)) {
      return {
        success: false,
        message: "Invalid event ID.",
      };
    }

    // Get the event
    const eventResult = await getEvent(eventOwnerId, eventId);
    if (!eventResult.success || !eventResult.data) {
      return {
        success: false,
        message: "Event not found or is not available.",
      };
    }

    const event = eventResult.data;

    // Get all dates in the range
    const dates = eachDayOfInterval({ start: startDate, end: endDate }).filter(
      (date) => date >= startOfDay(new Date()),
    ); // Filter out past dates

    if (dates.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Get the user's schedule once
    const scheduleResult = await getSchedule(eventOwnerId);
    if (!scheduleResult.success || !scheduleResult.data) {
      return {
        success: true,
        data: [], // No schedule means no available dates
      };
    }

    const schedule = scheduleResult.data;

    // Get calendar events for the entire date range once (optimization!)
    const { getCalendarEventTimes } = await import("./google-calendar");
    const calendarResult = await getCalendarEventTimes(eventOwnerId, {
      start: startDate,
      end: endDate,
    });

    const calendarEvents = calendarResult.success
      ? calendarResult.data || []
      : [];

    // Check availability for each date efficiently
    const availableDates: Date[] = [];

    for (const date of dates) {
      // Generate time slots for the day (every 15 minutes from 6 AM to 11 PM)
      const dayStart = startOfDay(date);
      const timeSlots: Date[] = [];

      // Start from 6 AM
      let currentTime = new Date(dayStart);
      currentTime.setHours(6, 0, 0, 0);

      // End at 11 PM
      const endTime = new Date(dayStart);
      endTime.setHours(23, 0, 0, 0);

      // Generate 15-minute slots
      while (currentTime <= endTime) {
        timeSlots.push(new Date(currentTime));
        currentTime = addMinutes(currentTime, 15);
      }

      // Convert time slots to user's timezone
      const timeSlotsInTimezone = timeSlots.map((slot) =>
        toZonedTime(slot, timezone),
      );

      // Check if any time slots are valid for this date using the batch-fetched calendar events
      const validTimes = await getValidTimesFromScheduleWithCalendarEvents(
        timeSlotsInTimezone,
        {
          clerkUserId: eventOwnerId,
          durationInMinutes: event.duration,
        },
        schedule,
        calendarEvents,
      );

      // If there are any valid times for this date, it's available
      if (validTimes.length > 0) {
        availableDates.push(date);
      }
    }

    return {
      success: true,
      data: availableDates,
    };
  } catch (error) {
    console.error("Failed to get available dates:", error);
    return {
      success: false,
      message:
        "Something went wrong while fetching available dates. Please try again.",
    };
  }
}

export async function getBookingById(
  bookingId: string,
): Promise<GetBookingResult> {
  try {
    // Validate UUID format
    if (!isValidUUID(bookingId)) {
      return {
        success: false,
        message: "Invalid booking ID.",
      };
    }

    // Get the booking
    const booking = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, bookingId))
      .limit(1);

    if (booking.length === 0) {
      return {
        success: false,
        message: "Booking not found.",
      };
    }

    return {
      success: true,
      data: booking[0],
    };
  } catch (error) {
    console.error("Failed to get booking:", error);
    return {
      success: false,
      message:
        "Something went wrong while fetching the booking. Please try again.",
    };
  }
}

// Helper function to check if a time slot is available
async function isTimeSlotAvailable(
  eventOwnerId: string,
  startTime: Date,
  endTime: Date,
): Promise<boolean> {
  try {
    // Check for existing bookings that overlap with the requested time
    const overlappingBookings = await db
      .select()
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.eventOwnerId, eventOwnerId),
          eq(bookingsTable.status, "confirmed"),
          // Check for overlap: start < requestedEnd AND end > requestedStart
          and(
            lte(bookingsTable.startTime, endTime),
            gte(bookingsTable.endTime, startTime),
          ),
        ),
      )
      .limit(1);

    return overlappingBookings.length === 0;
  } catch (error) {
    console.error("Error checking time slot availability:", error);
    return false;
  }
}
