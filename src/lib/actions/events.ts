"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { eventsTable } from "@/lib/db/schema";
import { eventFormSchema, type EventFormData } from "@/lib/validations";

type ActionResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// useActionState-compatible server action
export async function createEvent(
  prevState: ActionResult | null,
  data: EventFormData,
): Promise<ActionResult> {
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

    // Return success instead of redirect
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
