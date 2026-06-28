import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { researchRequests } from "./research-requests";
import { users } from "./users";
import { workspaces } from "./workspaces";

/** Shared company brain update suggestion (Company Brain Sync). No external writes yet. */
export const brainUpdates = pgTable("brain_updates", {
  id: text("id").primaryKey(),
  ownerUserId: text("owner_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reviewerUserId: text("reviewer_user_id").references(() => users.id, { onDelete: "set null" }),
  researchRequestId: text("research_request_id").references(() => researchRequests.id, {
    onDelete: "set null",
  }),
  workspaceId: text("workspace_id").references(() => workspaces.id, { onDelete: "set null" }),
  legacyId: text("legacy_id"),
  legacyResearchId: text("legacy_research_id"),
  status: text("status").notNull().default("Suggested"),
  reviewStatus: text("review_status"),
  priority: text("priority"),
  title: text("title").notNull(),
  description: text("description"),
  /** recommendedRecord, whatChanged, whyItMatters, draftUpdateText */
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

export type BrainUpdateRow = typeof brainUpdates.$inferSelect;
export type NewBrainUpdateRow = typeof brainUpdates.$inferInsert;
