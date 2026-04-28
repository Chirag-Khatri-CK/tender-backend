import { Router } from "express";
import { DirectorController } from "../../controllers/company/director.controller";
import { AppError } from "../../utils/AppError";

const router = Router({ mergeParams: true });

router.post("/", async (req: any, res) => {
  try {
    const out = await DirectorController.create(
      req.params.companyId, // comes from parent
      req.body
    );
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.get("/", async (req: any, res) => {
  try {
    const out = await DirectorController.list(
      req.params.companyId,
      req.query
    );
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const out = await DirectorController.get(req.params.id);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.patch("/:id", async (req: any, res) => {
  try {
    const out = await DirectorController.update(req.params.id, req.body);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const out = await DirectorController.remove(req.params.id);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

export default router;