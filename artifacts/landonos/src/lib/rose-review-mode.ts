// TODO: Temporary Rose Review Mode. Remove/disable after Command Center role-based auth is finalized.

export function isRoseReviewModeEnabled(): boolean {
  const enabled = import.meta.env.VITE_CCA_REVIEW_MODE === "true";
  const expiresAt = import.meta.env.VITE_CCA_REVIEW_MODE_EXPIRES_AT;
  if (!enabled || !expiresAt) return false;
  const expiry = new Date(expiresAt).getTime();
  if (Number.isNaN(expiry)) return false;
  return Date.now() < expiry;
}
