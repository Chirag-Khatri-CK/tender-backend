import express from "express";
import {
    getTenderController,
    listTendersController,
} from "../controllers/tender.controller";
import { AppError } from "../utils/AppError";

const router = express.Router();

router.get("/list", async (req, res) => {
    try {
        req.query.status = "PUBLISHED";
        req.query.sortField = "endDate";
        req.query.sortOrder = "asc";
        const out = await listTendersController(req.query);
        return res.json(out);
    } catch (err: any) {
        const status = err instanceof AppError ? err.status : 500;
        return res
            .status(status)
            .json({ success: false, message: err.message || "Failed to list tenders" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const out = await getTenderController({
            id: req.params.id,
            slug: req.query.slug as string,
            tenderId: req.query.tenderId as string,
            systemTenderNo: req.query.systemTenderNo as string,
        });
        return res.json(out);
    } catch (err: any) {
        const status = err instanceof AppError ? err.status : 500;
        console.error("getTender:", err);
        return res
            .status(status)
            .json({ success: false, message: err.message || "Failed to fetch tender" });
    }
});

export default router;