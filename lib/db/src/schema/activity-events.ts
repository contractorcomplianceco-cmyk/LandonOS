import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

/** Audit trail for shared record and workflow actions. */
export const activityEvents = pgTable("activity_events", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  eventType: text("event_type").notNull(),
  title: text("title"),
  description: text("description"),
  status: text("status"),
  priority: text("priority"),
  reviewStatus: text("review_status"),
  metadata: jsonb("metadata").notNull().default({}),
  commandCenterVisible: boolean("command_center_visible").notNull().default(true),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
});

export type ActivityEventRow = typeof activityEvents.$inferSelect;
export type NewActivityEventRow = typeof activityEvents.$inferInsert;
