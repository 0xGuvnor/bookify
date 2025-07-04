"use server";

import { env } from "@/lib/env";
import type {
  CreateCalendarEventResult,
  GetCalendarEventTimesResult,
} from "@/lib/types";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { formatISO } from "date-fns";
import { google } from "googleapis";

export async function getOAuthClient(clerkUserId: string) {
  try {
    // Get the Clerk client instance
    const client = await clerkClient();

    // Get the OAuth access token from Clerk for Google provider
    const clerkResponse = await client.users.getUserOauthAccessToken(
      clerkUserId,
      "google",
    );

    const accessToken = clerkResponse.data[0]?.token;

    if (!accessToken) {
      throw new Error("No Google OAuth access token found for user");
    }

    // Initialize Google OAuth2 client with credentials from env
    const oAuth2Client = new google.auth.OAuth2(
      env.GOOGLE_OAUTH_CLIENT_ID,
      env.GOOGLE_OAUTH_CLIENT_SECRET,
      env.GOOGLE_OAUTH_REDIRECT_URL,
    );

    // Set the access token on the OAuth2 client
    oAuth2Client.setCredentials({
      access_token: accessToken,
    });

    return oAuth2Client;
  } catch (error) {
    console.error("Error getting OAuth client:", error);
    throw new Error("Failed to initialize Google OAuth client");
  }
}

export async function getCurrentUserOAuthClient() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return getOAuthClient(userId);
}

export async function getCalendarEventTimes(
  clerkUserId: string,
  dateRange: { start: Date; end: Date },
): Promise<GetCalendarEventTimesResult> {
  try {
    // Get the OAuth client for the user
    const oAuth2Client = await getOAuthClient(clerkUserId);

    // Create calendar service instance
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    // Fetch events from the user's primary calendar within the date range
    const response = await calendar.events.list({
      calendarId: "primary",
      eventTypes: ["default"],
      timeMin: formatISO(dateRange.start),
      timeMax: formatISO(dateRange.end),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 250, // Google Calendar API default max is 250
    });

    const events = response.data.items || [];

    // Transform the events to include only the information we need
    const formattedEvents = events.map((event) => ({
      id: event.id,
      summary: event.summary || "No Title",
      description: event.description || null,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      location: event.location || null,
      attendees:
        event.attendees?.map((attendee) => ({
          email: attendee.email,
          displayName: attendee.displayName,
          responseStatus: attendee.responseStatus,
        })) || [],
      status: event.status,
      htmlLink: event.htmlLink,
      created: event.created,
      updated: event.updated,
    }));

    return {
      success: true,
      data: formattedEvents,
    };
  } catch (error) {
    console.error("Error fetching calendar events:", error);

    // Handle specific Google API errors
    if (error instanceof Error) {
      if (error.message.includes("invalid_grant")) {
        return {
          success: false,
          message:
            "Google Calendar access has expired. Please reconnect your account.",
        };
      }

      if (error.message.includes("insufficient_scope")) {
        return {
          success: false,
          message:
            "Insufficient permissions to access Google Calendar. Please reconnect your account.",
        };
      }
    }

    return {
      success: false,
      message:
        "Failed to fetch calendar events. Please try again or reconnect your Google account.",
    };
  }
}

export async function getCurrentUserCalendarEventTimes(dateRange: {
  start: Date;
  end: Date;
}): Promise<GetCalendarEventTimesResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  return getCalendarEventTimes(userId, dateRange);
}

export async function createCalendarEvent(
  eventOwnerClerkUserId: string,
  eventData: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendeeEmails: string[];
    location?: string;
    meetingLink?: string;
  },
): Promise<CreateCalendarEventResult> {
  try {
    // Get the OAuth client for the event owner
    const oAuth2Client = await getOAuthClient(eventOwnerClerkUserId);

    // Create calendar service instance
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    // Prepare event description
    let eventDescription = eventData.description || "";
    if (eventData.meetingLink) {
      eventDescription += `\n\nMeeting Link: ${eventData.meetingLink}`;
    }

    // Prepare attendees
    const attendees = eventData.attendeeEmails.map((email) => ({
      email,
      responseStatus: "needsAction",
    }));

    // Create the event
    const event = {
      summary: eventData.title,
      description: eventDescription,
      start: {
        dateTime: formatISO(eventData.startTime),
        timeZone: "UTC",
      },
      end: {
        dateTime: formatISO(eventData.endTime),
        timeZone: "UTC",
      },
      attendees,
      location: eventData.location,
      conferenceData: eventData.meetingLink
        ? {
            conferenceSolution: {
              key: {
                type: "hangoutsMeet",
              },
            },
            createRequest: {
              requestId: `meeting-${Date.now()}`,
            },
          }
        : undefined,
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 24 hours before
          { method: "popup", minutes: 30 }, // 30 minutes before
        ],
      },
      guestsCanInviteOthers: false,
      guestsCanSeeOtherGuests: true,
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: eventData.meetingLink ? 1 : 0,
      sendUpdates: "all", // Send email invites to all attendees
      requestBody: event,
    });

    if (!response.data.id) {
      throw new Error("Failed to create calendar event");
    }

    return {
      success: true,
      message: "Calendar event created successfully and invites sent!",
      data: {
        eventId: response.data.id,
        htmlLink: response.data.htmlLink || "",
      },
    };
  } catch (error) {
    console.error("Error creating calendar event:", error);

    // Handle specific Google API errors
    if (error instanceof Error) {
      if (error.message.includes("invalid_grant")) {
        return {
          success: false,
          message:
            "Google Calendar access has expired. Please reconnect your account.",
        };
      }

      if (error.message.includes("insufficient_scope")) {
        return {
          success: false,
          message:
            "Insufficient permissions to create calendar events. Please reconnect your account with calendar write permissions.",
        };
      }
    }

    return {
      success: false,
      message:
        "Failed to create calendar event. Please try again or reconnect your Google account.",
    };
  }
}
