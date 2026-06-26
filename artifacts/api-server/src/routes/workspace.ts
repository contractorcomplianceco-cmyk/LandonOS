import { Router, type IRouter } from "express";
import { requireApiKeyForMutations } from "../middleware/api-key";
import { isValidWorkspacePayload } from "../lib/workspace-validation";
import {
  clearOwnedWorkspaceData,
  getOwnedWorkspace,
  saveOwnedWorkspace,
} from "../lib/auth-service";
import { requireWorkspace } from "../middleware/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.use(requireWorkspace);
router.use(requireApiKeyForMutations);

/** Load the active workspace data for the signed-in user. */
router.get("/", async (req, res) => {
  try {
    const row = await getOwnedWorkspace(req.user!.id, req.workspaceId!);
    if (!row) {
      res.status(404).json({ error: "not_found", message: "Workspace not found" });
      return;
    }

    res.json({
      workspaceId: row.id,
      name: row.name,
      data: row.data,
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Failed to load workspace");
    res.status(503).json({ error: "database_error", message: "Could not load workspace" });
  }
});

/** Persist the active workspace blob. */
router.put("/", async (req, res) => {
  const payload = req.body;
  if (!isValidWorkspacePayload(payload)) {
    res.status(400).json({
      error: "invalid_payload",
      message: "Body must match the LandonOS AppData shape",
    });
    return;
  }

  try {
    const row = await saveOwnedWorkspace(req.user!.id, req.workspaceId!, payload);
    if (!row) {
      res.status(404).json({ error: "not_found", message: "Workspace not found" });
      return;
    }
    res.json({
      workspaceId: row.id,
      name: row.name,
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Failed to save workspace");
    res.status(503).json({ error: "database_error", message: "Could not save workspace" });
  }
});

/** Reset active workspace data to server defaults. */
router.delete("/", async (req, res) => {
  try {
    const row = await clearOwnedWorkspaceData(req.user!.id, req.workspaceId!);
    if (!row) {
      res.status(404).json({ error: "not_found", message: "Workspace not found" });
      return;
    }
    res.json({
      workspaceId: row.id,
      deleted: true,
      data: row.data,
    });
  } catch (err) {
    logger.error({ err }, "Failed to reset workspace");
    res.status(503).json({ error: "database_error", message: "Could not reset workspace" });
  }
});

export default router;
