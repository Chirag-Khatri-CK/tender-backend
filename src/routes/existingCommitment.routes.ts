
import { Router } from "express";
import { ExistingCommitmentController } from "../controllers/company/existingCommitment.controller";
import { AppError } from "../utils/AppError";
import { validateCompanyAccess } from "../middlewares/validateCompanyAccess";

const router = Router();

router.post("/:companyId", validateCompanyAccess, async (req: any, res) => {
  try {
    const out = await ExistingCommitmentController.create(
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
    const out = await ExistingCommitmentController.list(req.params.companyId, req.query);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.patch("/:id", async (req: any, res) => {
  try {
    const out = await ExistingCommitmentController.update(req.params.id, req.body);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const out = await ExistingCommitmentController.remove(req.params.id);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

export default router;
