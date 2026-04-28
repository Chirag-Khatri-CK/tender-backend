import { Router } from "express";
import { AuditController } from "../../controllers/company/audit.controller";
import { AppError } from "../../utils/AppError";

const router = Router({ mergeParams: true });

router.post("/", async (req: any, res) => {
  try {
    const out = await AuditController.create(req.params.companyId, req.body);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.get("/", async (req: any, res) => {
  try {
    const out = await AuditController.list(req.params.companyId, req.query);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const out = await AuditController.get(req.params.id);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.patch("/:id", async (req: any, res) => {
  try {
    const out = await AuditController.update(req.params.id, req.body);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const out = await AuditController.remove(req.params.id);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

export default router;