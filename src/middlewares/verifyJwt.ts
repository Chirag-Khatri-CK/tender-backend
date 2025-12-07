// src/middlewares/verifyJwt.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import User from '../models/User';
import { getSessionKey } from '../utils/mongoSessionStore';

type JwtPayloadLike = { sub?: string; role?: string; iat?: number; exp?: number;[k: string]: any };

export default async function verifyJwt(req: Request, res: Response, next: NextFunction) {
    try {
        // Accept Authorization header or x-access-token header
        const authHeader = (req.header('Authorization') || req.header('authorization') || '') as string;
        const fallback = (req.header('x-access-token') || '') as string;
        let token: string | null = null;

        if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.slice(7).trim();
        else if (fallback) token = fallback.trim();

        if (!token) return res.status(401).json({message : 'Missing auth token' });

        // verify signature & expiry
        let decoded: JwtPayloadLike;
        try {
            decoded = jwt.verify(token, (config.jwt && config.jwt.secret) || 'secret') as JwtPayloadLike;
        } catch (err: any) {
            return res.status(401).json({message : 'Invalid or expired token' });
        }

        if (!decoded || !decoded.sub) return res.status(401).json({message : 'Invalid token payload' });

        // Optional: check token revocation / session validity via session store
        const sessionKey = await getSessionKey(token);
        if (!sessionKey) {
            // session key missing -> token revoked or expired from session store
            return res.status(401).json({message : 'Session invalid or expired' });
        }

        // Fetch fresh user from DB
        const user = await User.findById(decoded.sub).lean();
        if (!user) return res.status(401).json({message : 'User not found' });

        // Attach minimal auth info and DB user
        (req as any).user = decoded;       // JWT payload (sub, role, etc.)
        (req as any).dbUser = user;        // full DB user doc (fresh)
        (req as any).sessionKey = sessionKey; // base64 session key used for crypto

        next();
    } catch (err: any) {
        console.error('verifyJwt error', err);
        return res.status(500).json({message : 'Internal auth error' });
    }
}
