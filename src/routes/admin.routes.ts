import { Router } from "express";
import {
  createAdminController,
  getAdminController,
  updateAdminController,
} from "../controllers/admin.controller";
import { dashboardAnalytics } from '../controllers/analytics.controller';
import { AppError } from "../utils/AppError";

const router = Router();

router.get("/dashboard-analytics", async (req, res) => {
  try {
    const out = await dashboardAnalytics(req.query);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { userId, permissions } = req.body;
    const out = await createAdminController(userId, permissions);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const out = await updateAdminController(req.params.id, req.body);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    return res.status(status).json({
      success: false,
      status,
      message: err.message || "Server error",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const out = await getAdminController(req.params.id);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

export default router;
