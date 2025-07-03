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
