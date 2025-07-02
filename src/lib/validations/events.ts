import { z } from "zod";

export const eventFormSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: "Event title is required.",
    })
    .max(100, {
      message: "Event title must be less than 100 characters.",
    }),
  description: z
    .string()
    .max(500, {
      message: "Description must be less than 500 characters.",
    })
    .optional()
    .or(z.literal("")),
  duration: z
    .number()
    .min(15, {
      message: "Duration must be at least 15 minutes.",
    })
    .max(721, {
      message: "Duration must be less than 12 hours.",
    }),
  location: z
    .string()
    .max(200, {
      message: "Location must be less than 200 characters.",
    })
    .optional()
    .or(z.literal("")),
  meetingLink: z
    .string()
    .refine(
      (value) => {
        // Allow empty strings or valid URLs
        if (!value || value.trim() === "") return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: "Please enter a valid URL or leave blank.",
      },
    )
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
  participants: z
    .array(
      z.string().email({
        message: "Please enter a valid email address.",
      }),
    )
    .min(1, {
      message: "At least one participant email is required.",
    })
    .max(50, {
      message: "Maximum 50 participants allowed.",
    })
    .refine(
      (emails) => {
        // Ensure no duplicate emails
        const uniqueEmails = new Set(
          emails.map((email) => email.toLowerCase()),
        );
        return uniqueEmails.size === emails.length;
      },
      {
        message: "Duplicate email addresses are not allowed.",
      },
    ),
});

export type EventFormData = z.infer<typeof eventFormSchema>;
