import type { Request, RequestHandler, Response } from "express";
import {
  readCookie,
  SESSION_COOKIE,
  WORKSPACE_COOKIE,
} from "../lib/cookies";
import {
  getOwnedWorkspace,
  resolveSession,
  type PublicUser,
} from "../lib/auth-service";

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
      workspaceId?: string;
    }
  }
}

export async function attachAuth(req: Request): Promise<void> {
  const token = readCookie(req, SESSION_COOKIE);
  req.user = (await resolveSession(token)) ?? undefined;

  const workspaceCookie = readCookie(req, WORKSPACE_COOKIE);
  if (req.user && workspaceCookie) {
    const owned = await getOwnedWorkspace(req.user.id, workspaceCookie);
    if (owned) req.workspaceId = owned.id;
  }
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  await attachAuth(req);
  if (!req.user) {
    res.status(401).json({ error: "unauthorized", message: "Sign in required" });
    return;
  }
  next();
};

export const requireWorkspace: RequestHandler = async (req, res, next) => {
  await attachAuth(req);
  if (!req.user) {
    res.status(401).json({ error: "unauthorized", message: "Sign in required" });
    return;
  }
  if (!req.workspaceId) {
    res.status(400).json({
      error: "no_workspace",
      message: "Select or create a workspace first",
    });
    return;
  }
  next();
};

export function sendAuthPayload(
  res: Response,
  payload: {
    user: PublicUser;
    sessionToken: string;
    activeWorkspaceId: string | null;
    workspaces: Awaited<ReturnType<typeof import("../lib/auth-service").listWorkspacesForUser>>;
  },
) {
  res.json({
    user: payload.user,
    workspaces: payload.workspaces,
    activeWorkspaceId: payload.activeWorkspaceId,
  });
}
