import { Router } from 'express';
import { signup, login, verifyContact } from '../controllers/auth.controller';
import { requestOtp, verifyOtp } from '../controllers/otp.controller';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/verify-contact', verifyContact);

export default router;
