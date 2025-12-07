// src/routes/index.ts
import { Router } from 'express';
import verifyJwt from '../middlewares/verifyJwt';
import requireRole from '../middlewares/requireRole';

// Routes (public)
import authRoutes from './auth.routes';
import otpRoutes from './otp.routes';
import decryptDebug from './decrypt.debug';     // debug decrypt route (public)
// protected
import userRoutes from './user.routes';
import adminRoutes from './admin.routes';
import contractorRoutes from './contractor.routes';
import tenderRoutes from './tender.routes';

const router = Router();

// --- Public routes (no auth) ---
// Decrypt debug route: keep it public only in dev/qa or protect it strongly in prod
router.use('/debug/decrypt', decryptDebug);
router.use('/auth', authRoutes);
router.use('/otp', otpRoutes);

router.get('/', (req, res) => res.json({ message: 'Tender API' }));

// Health - keep it here if you want it subject to encryption
router.get('/health', (req, res) => res.json({ ok: true }));

//  Protected routes
// router.use(verifyJwt);
router.use('/admin', adminRoutes);
router.use('/tender', tenderRoutes);
router.use('/contractor', contractorRoutes);

export default router;
