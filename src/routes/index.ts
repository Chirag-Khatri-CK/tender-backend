// src/routes/index.ts
import { Router } from 'express';
import verifyJwt from '../middlewares/verifyJwt';
import requireRole from '../middlewares/requireRole';

// Routes (public)
import authRoutes from './auth.routes';
import otpRoutes from './otp.routes';
import decryptDebug from './decrypt.debug';     // debug decrypt route (public)
import pubicRoutes from "./public.routes";
//cron
import cronRoutes from "./cron.routes";
// protected
import adminRoutes from './admin.routes';
import contractorRoutes from './contractor.routes';
import tenderRoutes from './tender.routes';
import companyRoutes from './company.routes';
import directorRoutes from "./director.routes";
import engineerRoutes from "./engineer.routes";
import equipmentRoutes from "./equipment.routes";
import registrationRoutes from "./registration.routes";
import bidRoutes from "./bid.routes";
import auditRoutes from "./audit.routes";
import experienceCertificateRoutes from "./experienceCertificate.routes";
import experienceQuantityRoutes from "./experienceQuantity.routes";
import existingCommitmentRoutes from "./existingCommitment.routes";
import { validateCompanyAccess } from '../middlewares/validateCompanyAccess';
const router = Router();

// --- Public routes (no auth) ---
// Decrypt debug route: keep it public only in dev/qa or protect it strongly in prod
router.use('/', pubicRoutes);
router.use('/debug/decrypt', decryptDebug);
router.use('/auth', authRoutes);
router.use('/otp', otpRoutes);

// cron sync routes
router.use('/cron', cronRoutes);

//  Protected routes
router.use('/admin', verifyJwt, requireRole('admin'), adminRoutes);
router.use('/contractor', verifyJwt, requireRole('admin', 'contractor'), contractorRoutes);
router.use('/tender', verifyJwt, tenderRoutes);
router.use('/company', verifyJwt, companyRoutes);
router.use("/director", verifyJwt, directorRoutes);
router.use("/engineer", verifyJwt, engineerRoutes);
router.use("/equipment", verifyJwt, equipmentRoutes);
router.use("/registration", verifyJwt, registrationRoutes);
router.use("/bid", verifyJwt, bidRoutes);
router.use("/audit", verifyJwt, auditRoutes);
router.use("/experience-certificate", verifyJwt, experienceCertificateRoutes);
router.use("/experience-quantity", verifyJwt, experienceQuantityRoutes);
router.use("/existing-commitment", verifyJwt, existingCommitmentRoutes);

export default router;
