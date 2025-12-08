// src/routes/public.routes.ts
import { Router } from "express";
import { listTendersController } from "../controllers/tender.controller";
import { AppError } from "../utils/AppError";

const router = Router();

router.get("/", (req, res) => res.json({ message: "Tender API" }));
router.get("/health", (req, res) => res.json({ ok: true }));

router.get("/tenders", async (req, res) => {
  try {
    const out = await listTendersController(req.query);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    return res
      .status(status)
      .json({ success: false, message: err.message || "Failed to list tenders" });
  }
});

export default router;
