import { Router } from "express";
import { requestOtpHandler, verifyOtpHandler } from "../controllers/otp.controller";
import { AppError } from "../utils/AppError";

const router = Router();
router.post("/request", async (req, res) => {
  try {
    const result = await requestOtpHandler(req.body);
    return res.status(200).json(result);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    return res.status(status).json({
      success: false,
      status,
      message: err.message || "Internal Server Error"
    });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const result = await verifyOtpHandler(req.body);
    return res.status(200).json(result);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    return res.status(status).json({
      success: false,
      status,
      message: err.message || "Internal Server Error"
    });
  }
});

export default router;
