// src/routes/index.ts
import { Router } from 'express';
import verifyJwt from '../middlewares/verifyJwt';
import requireRole from '../middlewares/requireRole';

// Routes (public)
import authRoutes from './auth.routes';
import otpRoutes from './otp.routes';
import decryptDebug from './decrypt.debug';     // debug decrypt route (public)
import pubicRoutes from "./public.routes";
// protected
import adminRoutes from './admin.routes';
import contractorRoutes from './contractor.routes';
import tenderRoutes from './tender.routes';

const router = Router();

// --- Public routes (no auth) ---
// Decrypt debug route: keep it public only in dev/qa or protect it strongly in prod
router.use('/', pubicRoutes);
router.use('/debug/decrypt', decryptDebug);
router.use('/auth', authRoutes);
router.use('/otp', otpRoutes);
//  Protected routes
router.use(verifyJwt);
router.use('/admin', requireRole('admin'), adminRoutes);
router.use('/tender', requireRole('admin'), tenderRoutes);
router.use('/contractor', requireRole('admin', 'contractor'), contractorRoutes);

export default router;
