import { Router } from "express";
import {
    createCompanyController,
    updateCompanyController,
    getCompanyController,
    listCompaniesController,
    deleteCompanyController,
} from "../controllers/company/companyProfile.controller";
import { AppError } from "../utils/AppError";
import { validateCompanyAccess } from "../middlewares/validateCompanyAccess";
import requireRole from '../middlewares/requireRole';


// const router = Router();

const router = Router({ mergeParams: true });

router.post("/", async (req: any, res) => {
    try {
        const out = await createCompanyController(req.user.userId, req.body);
        return res.json(out);
    } catch (err: any) {
        const status = err instanceof AppError ? err.status : 400;
        return res.status(status).json({ message: err.message });
    }
});

router.patch("/:id", validateCompanyAccess, async (req: any, res) => {
    try {
        const out = await updateCompanyController(
            req.params.id,
            req.body,
            req.user._id,
            req.user.role
        );
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

router.get("/:id", validateCompanyAccess, async (req: any, res) => {
    try {
        const out = await getCompanyController(
            req.params.id,
            req.user.userId,
            req.user.role
        );
        return res.json(out);
    } catch (err: any) {
        const status = err instanceof AppError ? err.status : 400;
        return res.status(status).json({ message: err.message });
    }
});

router.delete("/:id", validateCompanyAccess, async (req: any, res) => {
    try {
        const out = await deleteCompanyController(
            req.params.id,
            req.user.role
        );
        return res.json(out);
    } catch (err: any) {
        const status = err instanceof AppError ? err.status : 400;
        return res.status(status).json({ message: err.message });
    }
});

export default router;