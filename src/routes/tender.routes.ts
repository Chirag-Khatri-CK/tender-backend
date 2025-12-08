import express from "express";
import {
  createTenderController,
  getTenderController,
  listTendersController,
  updateTenderController,
  softDeleteTenderController,
  cancelTenderController,
} from "../controllers/tender.controller";
import { AppError } from "../utils/AppError";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const out = await createTenderController(req.body);
    return res.status(201).json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    console.error("createTender:", err);
    return res
      .status(status)
      .json({ success: false, message: err.message || "Failed to create tender" });
  }
});

router.get("/list", async (req, res) => {
  try {
    const out = await listTendersController(req.query);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    console.error("listTenders:", err);
    return res
      .status(status)
      .json({ success: false, message: err.message || "Failed to list tenders" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const out = await getTenderController({
      id: req.params.id,
      slug: req.query.slug as string,
      tenderId: req.query.tenderId as string,
      systemTenderNo: req.query.systemTenderNo as string,
    });
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    console.error("getTender:", err);
    return res
      .status(status)
      .json({ success: false, message: err.message || "Failed to fetch tender" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const out = await updateTenderController(req.params.id, req.body);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    console.error("updateTender:", err);
    return res
      .status(status)
      .json({ success: false, message: err.message || "Failed to update tender" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const out = await softDeleteTenderController(req.params.id);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    console.error("softDeleteTender:", err);
    return res
      .status(status)
      .json({ success: false, message: err.message || "Failed to delete tender" });
  }
});

router.post("/:id/cancel", async (req, res) => {
  try {
    const { cancelReason, cancelledByAdminId } = req.body;
    const out = await cancelTenderController(
      req.params.id,
      cancelReason,
      cancelledByAdminId
    );
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    console.error("cancelTender:", err);
    return res
      .status(status)
      .json({ success: false, message: err.message || "Failed to cancel tender" });
  }
});

export default router;
