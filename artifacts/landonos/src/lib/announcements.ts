import type { Accent } from "@/components/stat-card";
import type {
  Announcement,
  AnnouncementCategory,
  AnnouncementLevel,
} from "@/lib/types";

export const ANNOUNCEMENT_LEVELS: AnnouncementLevel[] = [
  "Info",
  "Important",
  "Critical",
];

export const ANNOUNCEMENT_CATEGORIES: AnnouncementCategory[] = [
  "Company",
  "Policy",
  "Compliance",
  "Operations",
  "Recognition",
];

/** Maps an announcement severity to an on-brand accent (slate → sky → red). */
export function levelAccent(level: AnnouncementLevel): Accent {
  if (level === "Critical") return "red";
  if (level === "Important") return "sky";
  return "slate";
}

/** Pinned first, then most recent by date. Returns a new array. */
export function sortAnnouncements(list: Announcement[]): Announcement[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.date.localeCompare(a.date);
  });
}
