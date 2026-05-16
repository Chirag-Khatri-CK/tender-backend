import { Router } from "express";
import { signupController, loginController } from "../controllers/auth.controller";
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
      role
    );
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("SIGNUP ERROR:", err);

    const status = err instanceof AppError ? err.status : 500;
    const message = err instanceof AppError ? err.message : err.message || "internal error";

    return res.status(status).json({
      success: false,
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
    console.error("LOGIN ERROR:", err);

    const status = err instanceof AppError ? err.status : 500;
    const message = err instanceof AppError ? err.message : err.message || "internal error";

    return res.status(status).json({
      success: false,
      message,
    });
  }
});

export default router;
