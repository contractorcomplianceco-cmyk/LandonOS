import { Router, type IRouter } from "express";
import { healthHandler } from "../lib/health-handler";

const router: IRouter = Router();

router.get("/healthz", healthHandler);

export default router;
