"use server";

import { db } from "@/lib/db";
import { eventsTable } from "@/lib/db/schema";
import type {
  CreateEventResult,
  UpdateEventResult,
  DeleteEventResult,
  GetEventsResult,
} from "@/lib/types";
import { eventFormSchema, type EventFormData } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createEvent(
  data: EventFormData,
): Promise<CreateEventResult> {
  try {
    // Get the current user
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to create an event.",
      };
    }

    // Validate the data using our Zod schema
    const validatedFields = eventFormSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Please check your form data and try again.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const {
      title,
      description,
      duration,
      isActive,
      location,
      meetingLink,
      participants,
    } = validatedFields.data;

    // Helper function to convert empty strings to null
    const emptyToNull = (value: string | undefined) =>
      !value || value.trim() === "" ? null : value;

    // Insert event into database
    await db.insert(eventsTable).values({
      title,
      description: emptyToNull(description),
      duration,
      clerkUserId: userId,
      isActive,
      location: emptyToNull(location),
      meetingLink: emptyToNull(meetingLink),
      participants: JSON.stringify(participants),
    });

    // Revalidate the events page to show the new event
    revalidatePath("/events");

    // Return success
    return {
      success: true,
      message: "Event created successfully!",
    };
  } catch (error) {
    console.error("Failed to create event:", error);
    return {
      success: false,
      message:
        "Something went wrong while creating your event. Please try again.",
    };
  }
}

export async function updateEvent(
  eventId: string,
  data: EventFormData,
): Promise<UpdateEventResult> {
  try {
    // Get the current user
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to update an event.",
      };
    }

    // Validate the data using our Zod schema
    const validatedFields = eventFormSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Please check your form data and try again.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const {
      title,
      description,
      duration,
      isActive,
      location,
      meetingLink,
      participants,
    } = validatedFields.data;

    // Helper function to convert empty strings to null
    const emptyToNull = (value: string | undefined) =>
      !value || value.trim() === "" ? null : value;

    // Check if event exists and belongs to the current user
    const existingEvent = await db
      .select()
      .from(eventsTable)
      .where(
        and(eq(eventsTable.id, eventId), eq(eventsTable.clerkUserId, userId)),
      )
      .limit(1);

    if (existingEvent.length === 0) {
      return {
        success: false,
        message: "Event not found or you don't have permission to edit it.",
      };
    }

    // Update the event in database
    await db
      .update(eventsTable)
      .set({
        title,
        description: emptyToNull(description),
        duration,
        isActive,
        location: emptyToNull(location),
        meetingLink: emptyToNull(meetingLink),
        participants: JSON.stringify(participants),
      })
      .where(
        and(eq(eventsTable.id, eventId), eq(eventsTable.clerkUserId, userId)),
      );

    // Revalidate the events page to show the updated event
    revalidatePath("/events");

    // Return success
    return {
      success: true,
      message: "Event updated successfully!",
    };
  } catch (error) {
    console.error("Failed to update event:", error);
    return {
      success: false,
      message:
        "Something went wrong while updating your event. Please try again.",
    };
  }
}

export async function deleteEvent(eventId: string): Promise<DeleteEventResult> {
  try {
    // Get the current user
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to delete an event.",
      };
    }

    // Check if event exists and belongs to the current user
    const existingEvent = await db
      .select()
      .from(eventsTable)
      .where(
        and(eq(eventsTable.id, eventId), eq(eventsTable.clerkUserId, userId)),
      )
      .limit(1);

    if (existingEvent.length === 0) {
      return {
        success: false,
        message: "Event not found or you don't have permission to delete it.",
      };
    }

    // Delete the event from database
    await db
      .delete(eventsTable)
      .where(
        and(eq(eventsTable.id, eventId), eq(eventsTable.clerkUserId, userId)),
      );

    // Revalidate the events page to remove the deleted event
    revalidatePath("/events");

    // Return success
    return {
      success: true,
      message: "Event deleted successfully!",
    };
  } catch (error) {
    console.error("Failed to delete event:", error);
    return {
      success: false,
      message:
        "Something went wrong while deleting your event. Please try again.",
    };
  }
}

export async function getEvents(userId: string): Promise<GetEventsResult> {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required to fetch events.",
      };
    }

    // Get all events for the specified user
    const events = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.clerkUserId, userId))
      .orderBy(desc(eventsTable.createdAt));

    // Return success with events
    return {
      success: true,
      events,
    };
  } catch (error) {
    console.error("Failed to get events:", error);
    return {
      success: false,
      message: "Something went wrong while fetching events. Please try again.",
    };
  }
}
