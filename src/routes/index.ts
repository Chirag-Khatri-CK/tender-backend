// src/routes/index.ts
import { Router } from 'express';
import verifyJwt from '../middlewares/verifyJwt';
import requireRole from '../middlewares/requireRole';

// Routes (public)
import authRoutes from './company.routes/auth.routes';
import otpRoutes from './otp.routes';
import decryptDebug from './decrypt.debug';     // debug decrypt route (public)
import pubicRoutes from "./public.routes";
//cron
import cronRoutes from "./cron.routes";
// protected
import adminRoutes from './admin.routes';
import contractorRoutes from './contractor.routes';
import tenderRoutes from './tender.routes';
import companyRoutes from './company.routes/company.routes';
import directorRoutes from "./company.routes/director.routes";
import engineerRoutes from "./company.routes/engineer.routes";
import equipmentRoutes from "./company.routes/equipment.routes";
import registrationRoutes from "./company.routes/registration.routes";
import bidRoutes from "./company.routes/bid.routes";
import auditRoutes from "./company.routes/audit.routes";
import experienceCertificateRoutes from "./company.routes/experienceCertificate.routes";
import experienceQuantityRoutes from "./company.routes/experienceQuantity.routes";
import existingCommitmentRoutes from "./company.routes/existingCommitment.routes";
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
