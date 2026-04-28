
import { Router } from "express";
import { BidController } from "../../controllers/company/bid.controller";
import { AppError } from "../../utils/AppError";

const router = Router();

router.post("/:companyId", async (req: any, res) => {
  try {
    const out = await BidController.create(
      req.params.companyId,
      req.body
    );
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.get("/:companyId", async (req: any, res) => {
  try {
    const out = await BidController.list(req.params.companyId, req.query);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.patch("/:id", async (req: any, res) => {
  try {
    const out = await BidController.update(req.params.id, req.body);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const out = await BidController.remove(req.params.id);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

export default router;
