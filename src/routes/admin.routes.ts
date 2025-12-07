import { Router } from 'express';
import { createAdmin, getAdmin, updateAdmin } from '../controllers/admin.controller';
const router = Router();

router.post('/', createAdmin);
router.patch('/:id', updateAdmin);
router.get('/:id', getAdmin);
export default router;
