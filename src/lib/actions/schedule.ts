"use server";

import { db } from "@/lib/db";
import { schedulesTable, scheduleAvailabilitiesTable } from "@/lib/db/schema";
import type {
  GetScheduleResult,
  CreateScheduleResult,
  UpdateScheduleResult,
} from "@/lib/types";
import { scheduleFormSchema, type ScheduleFormData } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";
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
        schedule: undefined,
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
      schedule: {
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
      schedule: {
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
      schedule: {
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
