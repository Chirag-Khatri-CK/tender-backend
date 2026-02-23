import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import User from '../models/core/User';

type JwtPayloadLike = {
    userId?: string;
    role?: string;
    iat?: number;
    exp?: number;
    [k: string]: any;
};

export default async function verifyJwt(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = (req.header('Authorization') || '') as string;
        const fallback = (req.header('x-access-token') || '') as string;

        let token: string | null = null;

        if (authHeader.startsWith('Bearer '))
            token = authHeader.slice(7).trim();
        else if (fallback)
            token = fallback.trim();

        if (!token)
            return res.status(401).json({ message: 'Missing auth token' });

        let decoded: JwtPayloadLike;

        try {
            decoded = jwt.verify(token, config.jwt.secret) as JwtPayloadLike;
        } catch {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        if (!decoded?.userId)
            return res.status(401).json({ message: 'Invalid token payload' });

        const user = await User.findById(decoded.userId).lean();
        if (!user)
            return res.status(401).json({ message: 'User not found' });

        (req as any).user = decoded;
        (req as any).dbUser = user;

        next();
    } catch (err) {
        console.error('verifyJwt error', err);
        return res.status(500).json({ message: 'Internal auth error' });
    }
}