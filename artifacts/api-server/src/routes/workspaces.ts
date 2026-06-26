import { Router, type IRouter } from "express";
import { setWorkspaceCookie } from "../lib/cookies";
import {
  createWorkspaceForUser,
  deleteOwnedWorkspace,
  getOwnedWorkspace,
  listWorkspacesForUser,
} from "../lib/auth-service";
import { requireAuth } from "../middleware/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.use(requireAuth);

/** List workspaces owned by the signed-in user. */
router.get("/", async (req, res) => {
  try {
    const workspaces = await listWorkspacesForUser(req.user!.id);
    res.json({ workspaces, activeWorkspaceId: req.workspaceId ?? null });
  } catch (err) {
    logger.error({ err }, "List workspaces failed");
    res.status(503).json({ error: "database_error", message: "Could not list workspaces" });
  }
});

/** Create a new workspace for the signed-in user. */
router.post("/", async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name : "New Workspace";
  try {
    const workspace = await createWorkspaceForUser(req.user!.id, name);
    setWorkspaceCookie(res, workspace.id);
    res.status(201).json({ workspace, activeWorkspaceId: workspace.id });
  } catch (err) {
    logger.error({ err }, "Create workspace failed");
    res.status(503).json({ error: "database_error", message: "Could not create workspace" });
  }
});

/** Switch the active workspace cookie. */
router.post("/:id/activate", async (req, res) => {
  const workspaceId = req.params.id;
  try {
    const owned = await getOwnedWorkspace(req.user!.id, workspaceId);
    if (!owned) {
      res.status(404).json({ error: "not_found", message: "Workspace not found" });
      return;
    }
    setWorkspaceCookie(res, workspaceId);
    res.json({
      activeWorkspaceId: workspaceId,
      workspace: { id: owned.id, name: owned.name, updatedAt: owned.updatedAt.toISOString() },
    });
  } catch (err) {
    logger.error({ err }, "Activate workspace failed");
    res.status(503).json({ error: "database_error", message: "Could not activate workspace" });
  }
});

/** Delete a workspace (must leave at least one — enforced client-side; server allows if >0). */
router.delete("/:id", async (req, res) => {
  const workspaceId = req.params.id;
  try {
    const all = await listWorkspacesForUser(req.user!.id);
    if (all.length <= 1) {
      res.status(400).json({
        error: "last_workspace",
        message: "You must keep at least one workspace",
      });
      return;
    }

    const deleted = await deleteOwnedWorkspace(req.user!.id, workspaceId);
    if (!deleted) {
      res.status(404).json({ error: "not_found", message: "Workspace not found" });
      return;
    }

    const remaining = all.filter((w) => w.id !== workspaceId);
    const next = remaining[0];
    if (next) setWorkspaceCookie(res, next.id);

    res.json({ deleted: true, activeWorkspaceId: next?.id ?? null });
  } catch (err) {
    logger.error({ err }, "Delete workspace failed");
    res.status(503).json({ error: "database_error", message: "Could not delete workspace" });
  }
});

export default router;
