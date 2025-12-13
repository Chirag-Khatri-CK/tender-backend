import { Router } from "express";
import {
  createContractorController,
  getContractorController,
  listContractorsController,
  updateContractorController,
} from "../controllers/contractor.controller";
import { AppError } from "../utils/AppError";

const router = Router();

router.post(
"/",
  async (req, res) => {
    try {
      const out = await createContractorController(req.body);
      return res.json(out);
    } catch (err: any) {
      const status = err instanceof AppError ? err.status : 400;
      return res.status(status).json({ message: err.message });
    }
  }
);

router.patch("/:id", async (req, res) => {
  try {
    const out = await updateContractorController(req.params.id, req.body);
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


router.get("/list", async (req, res) => {
  try {
    const out = await listContractorsController(req.query);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const out = await getContractorController(req.params.id);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});


export default router;
