import { Router } from "express";
import { ExperienceCertificateController } from "../../controllers/company/experienceCertificate.controller";
import { AppError } from "../../utils/AppError";

const router = Router({ mergeParams: true });

router.post("/", async (req: any, res) => {
  try {
    const out = await ExperienceCertificateController.create(
      req.params.companyId,
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
    const out = await ExperienceCertificateController.list(
      req.params.companyId,
      req.query
    );
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.patch("/:id", async (req: any, res) => {
  try {
    const out = await ExperienceCertificateController.update(
      req.params.id,
      req.body
    );
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const out = await ExperienceCertificateController.remove(req.params.id);
    return res.json(out);
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
});

export default router;