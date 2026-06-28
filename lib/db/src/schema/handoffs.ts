import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { reports } from "./reports";
import { researchRequests } from "./research-requests";
import { users } from "./users";
import { workspaces } from "./workspaces";

/** Shared handoff record (Finish Line Handoff). */
export const handoffs = pgTable("handoffs", {
  id: text("id").primaryKey(),
  ownerUserId: text("owner_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reviewerUserId: text("reviewer_user_id").references(() => users.id, { onDelete: "set null" }),
  researchRequestId: text("research_request_id").references(() => researchRequests.id, {
    onDelete: "set null",
  }),
  reportId: text("report_id").references(() => reports.id, { onDelete: "set null" }),
  workspaceId: text("workspace_id").references(() => workspaces.id, { onDelete: "set null" }),
  legacyId: text("legacy_id"),
  status: text("status").notNull().default("Draft"),
  reviewStatus: text("review_status"),
  priority: text("priority"),
  title: text("title").notNull(),
  description: text("description"),
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

export type HandoffRow = typeof handoffs.$inferSelect;
export type NewHandoffRow = typeof handoffs.$inferInsert;
