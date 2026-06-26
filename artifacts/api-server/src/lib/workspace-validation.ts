/** Minimal shape check for the AppData blob before persisting. */
export function isValidWorkspacePayload(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const requiredArrays = [
    "requests",
    "sources",
    "reports",
    "blockers",
    "handoffs",
    "ideas",
    "brainUpdates",
    "training",
    "announcements",
  ];

  for (const key of requiredArrays) {
    if (!Array.isArray((value as Record<string, unknown>)[key])) return false;
  }

  const settings = (value as Record<string, unknown>).settings;
  const rewardState = (value as Record<string, unknown>).rewardState;
  if (!settings || typeof settings !== "object") return false;
  if (!rewardState || typeof rewardState !== "object") return false;

  return true;
}
