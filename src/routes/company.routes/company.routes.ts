import { Router } from "express";
import {
    createCompanyController,
    updateCompanyController,
    getCompanyController,
    listCompaniesController,
    deleteCompanyController,
} from "../../controllers/company/companyProfile.controller";
import { AppError } from "../../utils/AppError";
import { validateCompanyAccess } from "../../middlewares/validateCompanyAccess";
import requireRole from '../../middlewares/requireRole';
import directorRoutes from "../company.routes/director.routes";
import engineerRoutes from "../company.routes/engineer.routes";
import equipmentRoutes from "../company.routes/equipment.routes";
import registrationRoutes from "../company.routes/registration.routes";
import bidRoutes from "../company.routes/bid.routes";
import auditRoutes from "../company.routes/audit.routes";
import experienceCertificateRoutes from "../company.routes/experienceCertificate.routes";
import experienceQuantityRoutes from "../company.routes/experienceQuantity.routes";
import existingCommitmentRoutes from "../company.routes/existingCommitment.routes";

const router = Router();

router.post("/", async (req: any, res) => {
    try {
        const out = await createCompanyController(req.user.userId, req.body);
        return res.json(out);
    } catch (err: any) {
        const status = err instanceof AppError ? err.status : 400;
        return res.status(status).json({ message: err.message });
    }
});

router.patch("/:companyId", validateCompanyAccess, async (req: any, res) => {
    try {
        const out = await updateCompanyController(req.params.companyId, req.body);
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

router.get("/list", requireRole('admin'), async (req, res) => {
    try {
        const out = await listCompaniesController(req.query);
        return res.json(out);
    } catch (err: any) {
        const status = err instanceof AppError ? err.status : 400;
        return res.status(status).json({ message: err.message });
    }
});

router.get("/:companyId", validateCompanyAccess, async (req: any, res) => {
    try {
        const out = await getCompanyController(req.params.companyId);
        return res.json(out);
    } catch (err: any) {
        const status = err instanceof AppError ? err.status : 400;
        return res.status(status).json({ message: err.message });
    }
});

router.delete("/:companyId", validateCompanyAccess, async (req: any, res) => {
    try {
        const out = await deleteCompanyController(
            req.params.companyId,
            req.user.role
        );
        return res.json(out);
    } catch (err: any) {
        const status = err instanceof AppError ? err.status : 400;
        return res.status(status).json({ message: err.message });
    }
});

// company children
router.use("/:companyId/director", directorRoutes);
router.use("/:companyId/engineer", engineerRoutes);
router.use("/:companyId/equipment", equipmentRoutes);
router.use("/:companyId/registration", registrationRoutes);
router.use("/:companyId/bid", bidRoutes);
router.use("/:companyId/audit", auditRoutes);
router.use("/:companyId/experience-certificate", experienceCertificateRoutes);
router.use("/:companyId/experience-quantity", experienceQuantityRoutes);
router.use("/:companyId/existing-commitment", existingCommitmentRoutes);

export default router;