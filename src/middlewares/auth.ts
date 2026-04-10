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
