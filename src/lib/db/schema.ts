import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Day of week enum for type safety
export const dayOfWeekEnum = pgEnum("day_of_week", [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]);

// Reusable timestamp fields
export const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

export const eventsTable = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    duration: integer("duration").notNull(), // Duration in minutes
    location: text("location"),
    meetingLink: text("meeting_link"),
    clerkUserId: text("clerk_user_id").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    participants: text("participants").notNull(), // JSON array of email strings
    ...timestamps,
  },
  (table) => [
    index("idx_events_clerk_user_id").on(table.clerkUserId),
    index("idx_events_is_active").on(table.isActive),
  ],
);

export const schedulesTable = pgTable(
  "schedules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    timezone: text("timezone").notNull(),
    ...timestamps,
  },
  (table) => [index("idx_schedules_clerk_user_id").on(table.clerkUserId)],
);

export const scheduleAvailabilitiesTable = pgTable(
  "schedule_availabilities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    scheduleId: uuid("schedule_id")
      .notNull()
      .references(() => schedulesTable.id, { onDelete: "cascade" }),
    dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    ...timestamps,
  },
  (table) => [
    index("idx_schedule_availabilities_schedule_id").on(table.scheduleId),
    index("idx_schedule_availabilities_day_of_week").on(table.dayOfWeek),
    index("idx_schedule_availabilities_schedule_day").on(
      table.scheduleId,
      table.dayOfWeek,
    ),
  ],
);

export const bookingsTable = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => eventsTable.id, { onDelete: "cascade" }),
    eventOwnerId: text("event_owner_id").notNull(), // Clerk user ID of the event owner
    bookerName: text("booker_name").notNull(),
    bookerEmail: text("booker_email").notNull(),
    bookerNotes: text("booker_notes"),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    status: text("status").notNull().default("confirmed"), // confirmed, cancelled, completed
    googleCalendarEventId: text("google_calendar_event_id"), // For calendar integration
    ...timestamps,
  },
  (table) => [
    index("idx_bookings_event_id").on(table.eventId),
    index("idx_bookings_event_owner_id").on(table.eventOwnerId),
    index("idx_bookings_booker_email").on(table.bookerEmail),
    index("idx_bookings_start_time").on(table.startTime),
    index("idx_bookings_status").on(table.status),
  ],
);

// Relations
export const schedulesRelations = relations(schedulesTable, ({ many }) => ({
  availabilities: many(scheduleAvailabilitiesTable),
}));

export const scheduleAvailabilitiesRelations = relations(
  scheduleAvailabilitiesTable,
  ({ one }) => ({
    schedule: one(schedulesTable, {
      fields: [scheduleAvailabilitiesTable.scheduleId],
      references: [schedulesTable.id],
    }),
  }),
);

export const eventsRelations = relations(eventsTable, ({ many }) => ({
  bookings: many(bookingsTable),
}));

export const bookingsRelations = relations(bookingsTable, ({ one }) => ({
  event: one(eventsTable, {
    fields: [bookingsTable.eventId],
    references: [eventsTable.id],
  }),
}));

export type Event = typeof eventsTable.$inferSelect;
export type NewEvent = typeof eventsTable.$inferInsert;

export type Schedule = typeof schedulesTable.$inferSelect;
export type NewSchedule = typeof schedulesTable.$inferInsert;

export type ScheduleAvailability =
  typeof scheduleAvailabilitiesTable.$inferSelect;
export type NewScheduleAvailability =
  typeof scheduleAvailabilitiesTable.$inferInsert;

export type Booking = typeof bookingsTable.$inferSelect;
export type NewBooking = typeof bookingsTable.$inferInsert;

// Type-safe day of week constants
export const DaysOfWeek = {
  SUNDAY: "sunday",
  MONDAY: "monday",
  TUESDAY: "tuesday",
  WEDNESDAY: "wednesday",
  THURSDAY: "thursday",
  FRIDAY: "friday",
  SATURDAY: "saturday",
} as const;

export type DayOfWeek = (typeof DaysOfWeek)[keyof typeof DaysOfWeek];
