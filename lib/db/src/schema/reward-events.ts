import { boolean, jsonb, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

/** Point ledger for Garage Rewards / leaderboard aggregation. */
export const rewardEvents = pgTable("reward_events", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ownerUserId: text("owner_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  eventType: text("event_type").notNull(),
  title: text("title"),
  description: text("description"),
  status: text("status"),
  priority: text("priority"),
  reviewStatus: text("review_status"),
  pointsDelta: integer("points_delta").notNull().default(0),
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

export type RewardEventRow = typeof rewardEvents.$inferSelect;
export type NewRewardEventRow = typeof rewardEvents.$inferInsert;
