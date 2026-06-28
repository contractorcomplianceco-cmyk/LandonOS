import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { researchRequests } from "./research-requests";
import { users } from "./users";
import { workspaces } from "./workspaces";

/** Shared source record (Source Garage). */
export const sources = pgTable("sources", {
  id: text("id").primaryKey(),
  ownerUserId: text("owner_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  researchRequestId: text("research_request_id").references(() => researchRequests.id, {
    onDelete: "set null",
  }),
  workspaceId: text("workspace_id").references(() => workspaces.id, { onDelete: "set null" }),
  legacyId: text("legacy_id"),
  /** Legacy blob relatedResearchId when shared row is not linked yet. */
  legacyResearchId: text("legacy_research_id"),
  status: text("status"),
  reviewStatus: text("review_status"),
  priority: text("priority"),
  title: text("title").notNull(),
  description: text("description"),
  /** urlOrFileRef, sourceType, ratings, tags, keyFacts, notes, dateCaptured */
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

export type SourceRow = typeof sources.$inferSelect;
export type NewSourceRow = typeof sources.$inferInsert;
