import { Router } from 'express';
import { createEmployee, getEmployee } from '../controllers/employee.controller';
import requireRole from '../middlewares/requireRole';
const router = Router();
router.post('/', requireRole('admin'), createEmployee);
router.get('/:id', requireRole('admin','engineer'), getEmployee);
export default router;
