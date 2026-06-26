import type { Request, Response } from "express";
import { pingDatabase } from "../lib/auth-service";

/** Shared health payload for /health and /api/healthz */
export async function healthHandler(_req: Request, res: Response): Promise<void> {
  const dbOk = await pingDatabase();
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? "ok" : "degraded",
    database: dbOk ? "connected" : "disconnected",
  });
}
