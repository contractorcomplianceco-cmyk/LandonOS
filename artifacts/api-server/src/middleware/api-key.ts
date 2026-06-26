import type { RequestHandler } from "express";

/**
 * Optional write protection. When API_KEY is set, mutating requests must send
 * X-API-Key. GET requests remain open so the SPA can load workspace data.
 */
export const requireApiKeyForMutations: RequestHandler = (req, res, next) => {
  if (req.user) return next();

  const expected = process.env.API_KEY;
  if (!expected) return next();

  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return next();
  }

  const provided = req.header("x-api-key");
  if (provided && provided === expected) return next();

  res.status(401).json({ error: "Unauthorized", message: "Valid X-API-Key required" });
};
