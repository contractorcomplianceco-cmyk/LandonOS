/** Temporary Rose Review Mode — server gate for review-session bootstrap only. */

export function isRoseReviewModeActive(): boolean {
  if (process.env.CCA_REVIEW_MODE !== "true") return false;
  const expiresAt = process.env.CCA_REVIEW_MODE_EXPIRES_AT;
  if (!expiresAt) return false;
  const expiry = new Date(expiresAt).getTime();
  if (Number.isNaN(expiry)) return false;
  return Date.now() < expiry;
}
