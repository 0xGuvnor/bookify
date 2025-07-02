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
    .optional(),
  duration: z
    .number()
    .min(15, {
      message: "Duration must be at least 15 minutes.",
    })
    .max(480, {
      message: "Duration must be less than 8 hours.",
    }),
  location: z
    .string()
    .max(200, {
      message: "Location must be less than 200 characters.",
    })
    .optional(),
  meetingLink: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
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
    }),
});

export type EventFormData = z.infer<typeof eventFormSchema>;
