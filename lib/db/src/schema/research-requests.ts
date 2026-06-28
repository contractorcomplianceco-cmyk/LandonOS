import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { workspaces } from "./workspaces";

/** Shared research request (Research Engine / Track Map). */
export const researchRequests = pgTable("research_requests", {
  id: text("id").primaryKey(),
  ownerUserId: text("owner_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reviewerUserId: text("reviewer_user_id").references(() => users.id, { onDelete: "set null" }),
  workspaceId: text("workspace_id").references(() => workspaces.id, { onDelete: "set null" }),
  /** Original id from the workspace JSONB blob during transition. */
  legacyId: text("legacy_id"),
  status: text("status").notNull().default("Open"),
  reviewStatus: text("review_status"),
  priority: text("priority").notNull().default("Medium"),
  title: text("title").notNull(),
  description: text("description"),
  researchType: text("research_type").notNull().default("Compliance"),
  /** GPS steps, requester/reviewer labels, due date, completion criteria, etc. */
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

export type ResearchRequestRow = typeof researchRequests.$inferSelect;
export type NewResearchRequestRow = typeof researchRequests.$inferInsert;
