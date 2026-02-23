import { Request, Response, NextFunction } from 'express';

export default function requireRole(...allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !user.role) return res.status(403).json({message : 'Access denied' });
    if (!allowed.includes(user.role)) return res.status(403).json({message : 'Insufficient role' });
    next();
  };
}
