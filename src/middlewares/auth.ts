import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyJwt = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.header('Authorization');
  if (!auth) return res.status(401).json({ message: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireRole = (role: string) => (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if(!user) return res.status(401).json({ message: 'Unauthorized' });
  if(user.role !== role && user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
};
