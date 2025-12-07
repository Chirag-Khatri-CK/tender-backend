"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.verifyJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyJwt = (req, res, next) => {
    const auth = req.header('Authorization');
    if (!auth)
        return res.status(401).json({ message: 'Unauthorized' });
    const token = auth.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'changeme');
        req.user = payload;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
exports.verifyJwt = verifyJwt;
const requireRole = (role) => (req, res, next) => {
    const user = req.user;
    if (!user)
        return res.status(401).json({ message: 'Unauthorized' });
    if (user.role !== role && user.role !== 'admin')
        return res.status(403).json({ message: 'Forbidden' });
    next();
};
exports.requireRole = requireRole;
