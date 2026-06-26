import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import workspacesRouter from "./workspaces";
import workspaceRouter from "./workspace";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/workspaces", workspacesRouter);
router.use("/workspace", workspaceRouter);

export default router;
