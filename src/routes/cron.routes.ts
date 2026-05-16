import { Router } from "express";
import { AppError } from "../utils/AppError";
import { syncTenders } from "../services/tenderSync.service";

const router = Router();

router.post("/tender-sync", async (req, res) => {
    try {
        await syncTenders();
        return res.json({
            message: "Sync started",
        });
    } catch (err: any) {
        const status = err instanceof AppError ? err.status : 400;
        return res.status(status).json({ message: err.message });
    }
}
);

export default router;
