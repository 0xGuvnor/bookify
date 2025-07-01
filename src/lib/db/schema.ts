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
    name: text("name").notNull(),
    description: text("description"),
    duration: integer("duration").notNull(), // Duration in minutes
    clerkUserId: text("clerk_user_id").notNull(),
    isActive: boolean("is_active").notNull().default(true),
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

export type Event = typeof eventsTable.$inferSelect;
export type NewEvent = typeof eventsTable.$inferInsert;

export type Schedule = typeof schedulesTable.$inferSelect;
export type NewSchedule = typeof schedulesTable.$inferInsert;

export type ScheduleAvailability =
  typeof scheduleAvailabilitiesTable.$inferSelect;
export type NewScheduleAvailability =
  typeof scheduleAvailabilitiesTable.$inferInsert;

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
