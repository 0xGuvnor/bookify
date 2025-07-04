import { z } from "zod";
import { DaysOfWeek } from "@/lib/db/schema";

// Day of week validation using the enum from schema - no duplication!
export const dayOfWeekSchema = z.enum(
  Object.values(DaysOfWeek) as [string, ...string[]],
);

// Time validation (HH:MM format, zero-padding optional)
export const timeSchema = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
  message: "Time must be in HH:MM format (24-hour)",
});

// Base availability slot schema (without refinement for extending)
export const baseAvailabilitySlotSchema = z.object({
  dayOfWeek: dayOfWeekSchema,
  startTime: timeSchema,
  endTime: timeSchema,
});

// Individual availability slot schema with validation
export const availabilitySlotSchema = baseAvailabilitySlotSchema.refine(
  (data) => data.startTime < data.endTime,
  {
    message: "End time must be after start time",
    path: ["endTime"],
  },
);

// Main schedule form schema
export const scheduleFormSchema = z.object({
  timezone: z
    .string()
    .min(1, "Timezone is required")
    .refine(
      (tz) => {
        try {
          // Validate timezone by trying to create a formatter with it
          Intl.DateTimeFormat(undefined, { timeZone: tz });
          return true;
        } catch {
          return false;
        }
      },
      {
        message: "Invalid timezone",
      },
    ),
  availabilities: z
    .array(availabilitySlotSchema)
    .min(1, "At least one availability slot is required"),
});

// Schema for updating an existing schedule
export const updateScheduleFormSchema = scheduleFormSchema.partial();

// Schema for individual availability slot creation/update
export const createAvailabilitySchema = baseAvailabilitySlotSchema
  .extend({
    scheduleId: z.string().uuid("Invalid schedule ID"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const updateAvailabilitySchema = baseAvailabilitySlotSchema
  .extend({
    id: z.string().uuid("Invalid availability ID"),
    scheduleId: z.string().uuid("Invalid schedule ID"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

// Utility schema for time range validation
export const timeRangeSchema = z
  .object({
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

// Helper function to normalize time to HH:MM format for HTML time inputs
export function normalizeTimeFormat(time: string): string {
  if (!time) return time;

  // Handle PostgreSQL TIME format (HH:MM:SS) -> HH:MM
  if (time.includes(":")) {
    const parts = time.split(":");
    if (parts.length >= 2) {
      const hours = parts[0].padStart(2, "0");
      const minutes = parts[1].padStart(2, "0");
      return `${hours}:${minutes}`;
    }
  }

  // Handle AM/PM format conversion
  if (time.includes("AM") || time.includes("PM")) {
    try {
      // Parse 12-hour format and convert to 24-hour
      const [timeStr, period] = time.split(" ");
      const [hours, minutes] = timeStr.split(":");
      let hour24 = parseInt(hours, 10);

      if (period === "PM" && hour24 !== 12) {
        hour24 += 12;
      } else if (period === "AM" && hour24 === 12) {
        hour24 = 0;
      }

      return `${hour24.toString().padStart(2, "0")}:${minutes.padStart(2, "0")}`;
    } catch (error) {
      console.error("Error converting time format:", time, error);
      return time;
    }
  }

  return time;
}

// Timezone conversion utilities
export function convertTimeToTimezone(
  time: string,
  fromTimezone: string,
  toTimezone: string,
): string {
  try {
    if (fromTimezone === toTimezone) {
      return time;
    }

    // Parse the time
    const [hours, minutes] = time.split(":").map(Number);

    // Create a date for today
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    // Create a date object with the given time
    const sourceDate = new Date(year, month, day, hours, minutes);

    // Convert to the source timezone first, then to target timezone
    // This approach simulates having a time in the source timezone
    const sourceTimestamp = sourceDate.getTime();

    // Get the timezone offset for both timezones at this date
    const sourceOffset = getTimezoneOffsetInMinutes(fromTimezone, sourceDate);
    const targetOffset = getTimezoneOffsetInMinutes(toTimezone, sourceDate);

    // Calculate the time difference
    const offsetDifference = targetOffset - sourceOffset;

    // Apply the offset difference
    const targetDate = new Date(sourceTimestamp + offsetDifference * 60000);

    // Format the result
    const targetHours = targetDate.getHours().toString().padStart(2, "0");
    const targetMinutes = targetDate.getMinutes().toString().padStart(2, "0");

    return `${targetHours}:${targetMinutes}`;
  } catch (error) {
    console.error("Error converting time between timezones:", error);
    return time; // Return original time if conversion fails
  }
}

// Get timezone offset in minutes for a given timezone and date
function getTimezoneOffsetInMinutes(timezone: string, date: Date): number {
  try {
    // Create formatters for UTC and the target timezone
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(
      date.toLocaleString("en-US", { timeZone: timezone }),
    );

    // Calculate the offset in minutes
    const offsetMs = tzDate.getTime() - utcDate.getTime();
    return Math.round(offsetMs / 60000);
  } catch (error) {
    console.error("Error getting timezone offset:", error);
    return 0;
  }
}

// More robust timezone conversion using proper date handling
export function convertTimeToTimezoneAdvanced(
  time: string,
  fromTimezone: string,
  toTimezone: string,
): string {
  try {
    if (fromTimezone === toTimezone) {
      return time;
    }

    // Parse the input time
    const [hours, minutes] = time.split(":").map(Number);

    // Create a date for today
    const today = new Date();

    // Create a date string in ISO format for the source timezone
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const hourStr = String(hours).padStart(2, "0");
    const minuteStr = String(minutes).padStart(2, "0");

    // Create the date assuming it's in the source timezone
    const dateString = `${year}-${month}-${day}T${hourStr}:${minuteStr}:00`;

    // Create a temporary date to work with
    const tempDate = new Date(dateString);

    // Get the offset difference between timezones
    const utcDate = new Date();
    const sourceInUTC = new Date(
      utcDate.toLocaleString("en-US", { timeZone: fromTimezone }),
    );
    const targetInUTC = new Date(
      utcDate.toLocaleString("en-US", { timeZone: toTimezone }),
    );
    const offsetDiff = targetInUTC.getTime() - sourceInUTC.getTime();

    // Apply the offset to our original time
    const resultDate = new Date(tempDate.getTime() + offsetDiff);

    // Format the result
    const resultHours = resultDate.getHours().toString().padStart(2, "0");
    const resultMinutes = resultDate.getMinutes().toString().padStart(2, "0");

    return `${resultHours}:${resultMinutes}`;
  } catch (error) {
    console.error("Error converting time between timezones:", error);
    return time; // Return original time if conversion fails
  }
}

// Convert a time slot between timezones
export function convertAvailabilitySlotTimezone(
  slot: AvailabilitySlotData,
  fromTimezone: string,
  toTimezone: string,
): AvailabilitySlotData {
  if (fromTimezone === toTimezone) {
    return slot;
  }

  try {
    const convertedStartTime = convertTimeToTimezoneAdvanced(
      slot.startTime,
      fromTimezone,
      toTimezone,
    );
    const convertedEndTime = convertTimeToTimezoneAdvanced(
      slot.endTime,
      fromTimezone,
      toTimezone,
    );

    return {
      ...slot,
      startTime: convertedStartTime,
      endTime: convertedEndTime,
    };
  } catch (error) {
    console.error("Error converting availability slot timezone:", error);
    return slot; // Return original slot if conversion fails
  }
}

// Convert all availability slots from one timezone to another
export function convertAvailabilitiesTimezone(
  availabilities: AvailabilitySlotData[],
  fromTimezone: string,
  toTimezone: string,
): AvailabilitySlotData[] {
  if (fromTimezone === toTimezone) {
    return availabilities;
  }

  return availabilities.map((slot) =>
    convertAvailabilitySlotTimezone(slot, fromTimezone, toTimezone),
  );
}

// Helper function to get default availability for a day
export function getDefaultAvailabilityForDay(day: string) {
  const isWeekend = day === DaysOfWeek.SUNDAY || day === DaysOfWeek.SATURDAY;

  return {
    dayOfWeek: day as keyof typeof DaysOfWeek,
    startTime: isWeekend ? "10:00" : "09:00",
    endTime: isWeekend ? "16:00" : "17:00",
  };
}

// Overlap detection utility with detailed conflict information
export interface OverlapConflict {
  day: string;
  conflictingSlots: Array<{
    index: number;
    startTime: string;
    endTime: string;
  }>;
  message: string;
}

export function detectOverlaps(availabilities: AvailabilitySlotData[]): {
  hasConflicts: boolean;
  conflicts: OverlapConflict[];
} {
  // Helper function to convert HH:MM to minutes for accurate comparison
  // Handles both "9:00" and "09:00" formats
  const timeToMinutes = (time: string): number => {
    const [hoursStr, minutesStr] = time.split(":");
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    // Validate parsed values
    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      throw new Error(`Invalid time format: ${time}`);
    }

    return hours * 60 + minutes;
  };

  const conflicts: OverlapConflict[] = [];

  // Group slots by day
  const daySlots = new Map<
    string,
    Array<{
      index: number;
      start: number;
      end: number;
      originalStart: string;
      originalEnd: string;
    }>
  >();

  availabilities.forEach((slot, index) => {
    if (!daySlots.has(slot.dayOfWeek)) {
      daySlots.set(slot.dayOfWeek, []);
    }
    daySlots.get(slot.dayOfWeek)!.push({
      index,
      start: timeToMinutes(slot.startTime),
      end: timeToMinutes(slot.endTime),
      originalStart: slot.startTime,
      originalEnd: slot.endTime,
    });
  });

  // Check for overlaps within each day
  for (const [dayName, slots] of daySlots) {
    const conflictingIndices = new Set<number>();

    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const slot1 = slots[i];
        const slot2 = slots[j];

        // Check if slots overlap using standard interval overlap detection
        // Two intervals [a,b] and [c,d] overlap if: a < d AND b > c
        // This excludes touching boundaries (e.g., 9:00-12:00 and 12:00-15:00)
        if (slot1.start < slot2.end && slot1.end > slot2.start) {
          conflictingIndices.add(slot1.index);
          conflictingIndices.add(slot2.index);
        }
      }
    }

    if (conflictingIndices.size > 0) {
      // Get display name for the day
      const dayDisplayName =
        Object.entries(DaysOfWeek)
          .find(([, value]) => value === dayName)?.[0]
          ?.toLowerCase()
          .replace(/^\w/, (c) => c.toUpperCase()) || dayName;

      const conflictingSlots = slots
        .filter((slot) => conflictingIndices.has(slot.index))
        .map((slot) => ({
          index: slot.index,
          startTime: slot.originalStart,
          endTime: slot.originalEnd,
        }));

      conflicts.push({
        day: dayName,
        conflictingSlots,
        message: `Time slots overlap on ${dayDisplayName}. Please adjust the times to avoid conflicts.`,
      });
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
}

// Type exports for use throughout the app
export type ScheduleFormData = z.infer<typeof scheduleFormSchema>;
export type UpdateScheduleFormData = z.infer<typeof updateScheduleFormSchema>;
export type AvailabilitySlotData = z.infer<typeof availabilitySlotSchema>;
export type CreateAvailabilityData = z.infer<typeof createAvailabilitySchema>;
export type UpdateAvailabilityData = z.infer<typeof updateAvailabilitySchema>;
export type TimeRangeData = z.infer<typeof timeRangeSchema>;
export type DayOfWeekType = z.infer<typeof dayOfWeekSchema>;
