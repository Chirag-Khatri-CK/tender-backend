"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = requireRole;
// require that req.user.role exists and matches one of allowed roles
function requireRole(...allowed) {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !user.role)
            return res.status(403).json({ message: 'Access denied' });
        if (!allowed.includes(user.role))
            return res.status(403).json({ message: 'Insufficient role' });
        next();
    };
}
