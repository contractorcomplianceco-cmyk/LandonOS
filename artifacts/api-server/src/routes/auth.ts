import { Router, type IRouter } from "express";
import {
  clearSessionCookie,
  clearWorkspaceCookie,
  readCookie,
  SESSION_COOKIE,
  setSessionCookie,
  setWorkspaceCookie,
} from "../lib/cookies";
import {
  createWorkspaceForUser,
  ensureReviewSession,
  getOwnedWorkspace,
  listWorkspacesForUser,
  loginUser,
  logoutSession,
  registerUser,
  resolveSession,
} from "../lib/auth-service";
import { attachAuth } from "../middleware/auth";
import { isRoseReviewModeActive } from "../lib/review-mode";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/register", async (req, res) => {
  const { email, password, displayName } = req.body ?? {};
  if (!email || !password || typeof password !== "string" || password.length < 8) {
    res.status(400).json({
      error: "invalid_input",
      message: "Email and password (min 8 characters) are required",
    });
    return;
  }

  try {
    const result = await registerUser({ email, password, displayName: displayName ?? "" });
    setSessionCookie(res, result.sessionToken);
    setWorkspaceCookie(res, result.activeWorkspaceId);
    const workspaces = await listWorkspacesForUser(result.user.id);
    res.status(201).json({
      user: result.user,
      workspaces,
      activeWorkspaceId: result.activeWorkspaceId,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "email_taken") {
      res.status(409).json({ error: "email_taken", message: "An account with this email already exists" });
      return;
    }
    logger.error({ err }, "Register failed");
    res.status(503).json({ error: "server_error", message: "Could not create account" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: "invalid_input", message: "Email and password are required" });
    return;
  }

  try {
    const result = await loginUser(email, password);
    setSessionCookie(res, result.sessionToken);
    if (result.activeWorkspaceId) {
      setWorkspaceCookie(res, result.activeWorkspaceId);
    }
    const workspaces = await listWorkspacesForUser(result.user.id);
    res.json({
      user: result.user,
      workspaces,
      activeWorkspaceId: result.activeWorkspaceId,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "invalid_credentials") {
      res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
      return;
    }
    logger.error({ err }, "Login failed");
    res.status(503).json({ error: "server_error", message: "Could not sign in" });
  }
});

router.post("/logout", async (req, res) => {
  const token = readCookie(req, SESSION_COOKIE);
  await logoutSession(token);
  clearSessionCookie(res);
  clearWorkspaceCookie(res);
  res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  await attachAuth(req);
  if (!req.user) {
    res.status(401).json({ error: "unauthorized", message: "Not signed in" });
    return;
  }

  const workspaces = await listWorkspacesForUser(req.user.id);
  res.json({
    user: req.user,
    workspaces,
    activeWorkspaceId: req.workspaceId ?? workspaces[0]?.id ?? null,
  });
});

/** Rose Review Mode — silent session for live workspace sync (no login wall). */
router.post("/review-session", async (req, res) => {
  if (!isRoseReviewModeActive()) {
    res.status(403).json({ error: "forbidden", message: "Review mode is not active" });
    return;
  }

  try {
    const result = await ensureReviewSession();
    setSessionCookie(res, result.sessionToken);
    setWorkspaceCookie(res, result.activeWorkspaceId);
    const workspaces = await listWorkspacesForUser(result.user.id);
    res.json({
      user: result.user,
      workspaces,
      activeWorkspaceId: result.activeWorkspaceId,
    });
  } catch (err) {
    logger.error({ err }, "Review session bootstrap failed");
    res.status(503).json({ error: "server_error", message: "Could not start review session" });
  }
});

export default router;
