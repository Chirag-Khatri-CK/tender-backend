"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/index.ts
const express_1 = require("express");
// Routes (public)
const auth_routes_1 = __importDefault(require("./auth.routes"));
const otp_routes_1 = __importDefault(require("./otp.routes"));
const decrypt_debug_1 = __importDefault(require("./decrypt.debug")); // debug decrypt route (public)
const admin_routes_1 = __importDefault(require("./admin.routes"));
const contractor_routes_1 = __importDefault(require("./contractor.routes"));
const tender_routes_1 = __importDefault(require("./tender.routes"));
const router = (0, express_1.Router)();
// --- Public routes (no auth) ---
// Decrypt debug route: keep it public only in dev/qa or protect it strongly in prod
router.use('/debug/decrypt', decrypt_debug_1.default);
router.use('/auth', auth_routes_1.default);
router.use('/otp', otp_routes_1.default);
router.get('/', (req, res) => res.json({ message: 'Tender API' }));
// Health - keep it here if you want it subject to encryption
router.get('/health', (req, res) => res.json({ ok: true }));
//  Protected routes
// router.use(verifyJwt);
router.use('/admin', admin_routes_1.default);
router.use('/tender', tender_routes_1.default);
router.use('/contractor', contractor_routes_1.default);
exports.default = router;
