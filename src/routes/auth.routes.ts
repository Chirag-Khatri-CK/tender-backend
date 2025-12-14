import { Router } from "express";
import {
  signupController,
  loginController,
  verifyContactController,
} from "../controllers/auth.controller";
import {
  requestOtpController,
  verifyOtpController,
} from "../controllers/otp.controller";
import { AppError } from "../utils/AppError";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password, name, phone, role, method } = req.body;
    const result = await signupController(
      email,
      password,
      name,
      phone,
      role,
      method
    );
    return res.status(200).json(result);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    const message = err instanceof AppError ? err.message : "internal error";
    return res.status(200).json({
      success: false,
      status,
      message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, phone } = req.body;
    const result = await loginController(email, password, phone);
    return res.status(200).json(result);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    const message = err instanceof AppError ? err.message : "internal error";
    return res.status(200).json({
      success: false,
      status,
      message,
    });
  }
});

// Auth-specific verify contact (activation)
router.post("/verify-contact", async (req, res) => {
  try {
    const { otpId, userId, code, email } = req.body;
    const result = await verifyContactController(otpId, userId, code, email);
    return res.status(200).json(result);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    const message = err instanceof AppError ? err.message : "internal error";
    return res.status(200).json({
      success: false,
      status,
      message,
    });
  }
});

// Optional: expose OTP helper endpoints here if you want them under /auth
router.post("/request-otp", async (req, res) => {
  try {
    const { userId, method } = req.body;
    const result = await requestOtpController(userId, method);
    return res.status(200).json(result);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    return res.status(status).json({
      success: false,
      status,
      message: err.message || "error",
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { userId, code } = req.body;
    const result = await verifyOtpController(userId, code);
    return res.status(200).json(result);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    return res.status(status).json({
      success: false,
      status,
      message: err.message || "error",
    });
  }
});

export default router;
