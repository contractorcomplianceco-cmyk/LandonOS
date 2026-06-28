import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { workspaces } from "./workspaces";

/** Shared idea record (Idea Garage). */
export const ideas = pgTable("ideas", {
  id: text("id").primaryKey(),
  ownerUserId: text("owner_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reviewerUserId: text("reviewer_user_id").references(() => users.id, { onDelete: "set null" }),
  workspaceId: text("workspace_id").references(() => workspaces.id, { onDelete: "set null" }),
  legacyId: text("legacy_id"),
  status: text("status").notNull().default("Active"),
  reviewStatus: text("review_status"),
  priority: text("priority"),
  title: text("title").notNull(),
  description: text("description"),
  /** category, whyItMatters, suggestedNextAction, convertTo, convertedEntityId */
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

export type IdeaRow = typeof ideas.$inferSelect;
export type NewIdeaRow = typeof ideas.$inferInsert;
