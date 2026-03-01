import { Router } from "express";
import { signupController, loginController } from "../../controllers/auth.controller";
import { AppError } from "../../utils/AppError";

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

export default router;
