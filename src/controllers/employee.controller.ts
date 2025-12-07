import { Request, Response } from 'express';
import Employee from '../models/Employee';

export async function createEmployee(req: Request, res: Response) {
  try {
    const payload = req.body;
    const doc = await Employee.create(payload);
    return res.json({ ok: true, employee: doc });
  } catch (err: any) {
    return res.status(400).json({message : err.message });
  }
}

export async function getEmployee(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const doc = await Employee.findById(id).lean();
    if (!doc) return res.status(404).json({message : 'not found' });
    return res.json({ employee: doc });
  } catch (err: any) {
    return res.status(400).json({message : err.message });
  }
}
