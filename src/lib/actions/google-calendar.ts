"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";
import { env } from "@/lib/env";

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
