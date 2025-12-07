import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import config from '../config';
export default (req: Request, res: Response, next: NextFunction) => {
  const header = req.header(config.correlationHeader || 'x-correlation-id');
  const id = header && header.trim().length > 0 ? header : randomUUID();
  res.setHeader(config.correlationHeader || 'x-correlation-id', id);
  (req as any).correlationId = id;
  res.locals.correlationId = id;
  next();
};
