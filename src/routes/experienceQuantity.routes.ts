
import { Router } from "express";
import { ExperienceQuantityController } from "../controllers/company/experienceQuantity.controller";
import { AppError } from "../utils/AppError";
import { validateCompanyAccess } from "../middlewares/validateCompanyAccess";

const router = Router();

router.post("/:companyId", validateCompanyAccess, async (req: any, res) => {
  try {
    const out = await ExperienceQuantityController.create(
      req.params.companyId,
      req.body
    );
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.get("/:companyId", validateCompanyAccess, async (req: any, res) => {
  try {
    const out = await ExperienceQuantityController.list(req.params.companyId, req.query);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.patch("/:id", async (req: any, res) => {
  try {
    const out = await ExperienceQuantityController.update(req.params.id, req.body);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const out = await ExperienceQuantityController.remove(req.params.id);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

export default router;
