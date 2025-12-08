import { Router } from "express";
import {
  requestOtpController,
  verifyOtpController,
} from "../controllers/otp.controller";
import { AppError } from "../utils/AppError";

const router = Router();

router.post("/request", async (req, res) => {
  try {
    const { userId, method } = req.body;
    const result = await requestOtpController(userId, method);
    return res.status(200).json(result);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    return res.status(status).json({ message: err.message || "error" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { userId, code } = req.body;
    const result = await verifyOtpController(userId, code);
    return res.status(200).json(result);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    return res.status(status).json({ message: err.message || "error" });
  }
});

export default router;
