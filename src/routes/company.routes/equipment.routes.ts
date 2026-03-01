
import { Router } from "express";
import { EquipmentController } from "../../controllers/company/equipment.controller";
import { AppError } from "../../utils/AppError";
import { validateCompanyAccess } from "../../middlewares/validateCompanyAccess";

const router = Router();

router.post("/:companyId", validateCompanyAccess, async (req: any, res) => {
  try {
    const out = await EquipmentController.create(
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
    const out = await EquipmentController.list(req.params.companyId, req.query);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.patch("/:id", validateCompanyAccess, async (req: any, res) => {
  try {
    const out = await EquipmentController.update(req.params.id, req.body);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const out = await EquipmentController.remove(req.params.id);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

export default router;
