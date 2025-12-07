import { Router } from 'express';
import { requestOtp, verifyOtp } from '../controllers/otp.controller';
const router = Router();
router.post('/request', requestOtp);
router.post('/verify', verifyOtp);
export default router;
