import { Router } from 'express';
import { createContractor, getContractor } from '../controllers/contractor.controller';
import requireRole from '../middlewares/requireRole';
const router = Router();
router.post('/', requireRole('admin','contractor'), createContractor);
router.get('/:id', getContractor);
export default router;
