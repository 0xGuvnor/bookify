import { z } from "zod";

export const bookingFormSchema = z.object({
  bookerName: z
    .string()
    .min(1, {
      message: "Name is required.",
    })
    .max(100, {
      message: "Name must be less than 100 characters.",
    }),
  bookerEmail: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    })
    .max(255, {
      message: "Email must be less than 255 characters.",
    }),
  bookerNotes: z
    .string()
    .max(500, {
      message: "Notes must be less than 500 characters.",
    })
    .optional()
    .or(z.literal("")),
  selectedDate: z
    .string()
    .min(1, {
      message: "Please select a date.",
    })
    .refine(
      (dateString) => {
        const date = new Date(dateString);
        return (
          !isNaN(date.getTime()) &&
          date >= new Date(new Date().setHours(0, 0, 0, 0))
        );
      },
      {
        message: "Please select a valid date in the future.",
      },
    ),
  selectedTime: z
    .string()
    .min(1, {
      message: "Please select a time slot.",
    })
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Please select a valid time slot.",
    }),
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
});

export const createBookingSchema = bookingFormSchema.extend({
  eventId: z.string().uuid("Invalid event ID"),
  eventOwnerId: z.string().min(1, "Event owner ID is required"),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
});

export const updateBookingSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  status: z.enum(["confirmed", "cancelled", "completed"], {
    errorMap: () => ({
      message: "Status must be confirmed, cancelled, or completed",
    }),
  }),
  bookerNotes: z
    .string()
    .max(500, {
      message: "Notes must be less than 500 characters.",
    })
    .optional()
    .or(z.literal("")),
});

export const getBookingsSchema = z.object({
  eventId: z.string().uuid("Invalid event ID").optional(),
  eventOwnerId: z.string().min(1, "Event owner ID is required").optional(),
  bookerEmail: z.string().email("Invalid email address").optional(),
  status: z.enum(["confirmed", "cancelled", "completed"]).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;
export type CreateBookingData = z.infer<typeof createBookingSchema>;
export type UpdateBookingData = z.infer<typeof updateBookingSchema>;
export type GetBookingsData = z.infer<typeof getBookingsSchema>;
