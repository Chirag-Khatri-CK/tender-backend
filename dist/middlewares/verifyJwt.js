"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = verifyJwt;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const User_1 = __importDefault(require("../models/User"));
const mongoSessionStore_1 = require("../utils/mongoSessionStore");
async function verifyJwt(req, res, next) {
    try {
        // Accept Authorization header or x-access-token header
        const authHeader = (req.header('Authorization') || req.header('authorization') || '');
        const fallback = (req.header('x-access-token') || '');
        let token = null;
        if (authHeader && authHeader.startsWith('Bearer '))
            token = authHeader.slice(7).trim();
        else if (fallback)
            token = fallback.trim();
        if (!token)
            return res.status(401).json({ message: 'Missing auth token' });
        // verify signature & expiry
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, (config_1.default.jwt && config_1.default.jwt.secret) || 'secret');
        }
        catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        if (!decoded || !decoded.sub)
            return res.status(401).json({ message: 'Invalid token payload' });
        // Optional: check token revocation / session validity via session store
        const sessionKey = await (0, mongoSessionStore_1.getSessionKey)(token);
        if (!sessionKey) {
            // session key missing -> token revoked or expired from session store
            return res.status(401).json({ message: 'Session invalid or expired' });
        }
        // Fetch fresh user from DB
        const user = await User_1.default.findById(decoded.sub).lean();
        if (!user)
            return res.status(401).json({ message: 'User not found' });
        // Attach minimal auth info and DB user
        req.user = decoded; // JWT payload (sub, role, etc.)
        req.dbUser = user; // full DB user doc (fresh)
        req.sessionKey = sessionKey; // base64 session key used for crypto
        next();
    }
    catch (err) {
        console.error('verifyJwt error', err);
        return res.status(500).json({ message: 'Internal auth error' });
    }
}
