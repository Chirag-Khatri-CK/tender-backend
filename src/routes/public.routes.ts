// src/routes/public.routes.ts
import { Router } from "express"; 
import tenderRoutes from './tender.public.routes';

const router = Router();

router.get("/", (req, res) => res.json({ message: "Tender API" }));
router.get("/health", (req, res) => res.json({ ok: true }));
router.use('/tender', tenderRoutes);

export default router;
