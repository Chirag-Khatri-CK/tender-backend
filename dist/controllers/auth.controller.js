"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.verifyContact = verifyContact;
exports.login = login;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = __importDefault(require("../config"));
const User_1 = __importDefault(require("../models/User"));
const Otp_1 = __importDefault(require("../models/Otp"));
const Admin_1 = __importDefault(require("../models/Admin"));
const Contractor_1 = __importDefault(require("../models/Contractor"));
const Engineer_1 = __importDefault(require("../models/Engineer"));
async function ensureRoleDoc(user) {
    const uid = user._id;
    if (user.role === 'admin') {
        if (!await Admin_1.default.findOne({ userId: uid })) {
            await Admin_1.default.create({ userId: uid, permissions: [] });
        }
    }
    else if (user.role === 'contractor') {
        if (!await Contractor_1.default.findOne({ userId: uid })) {
            await Contractor_1.default.create({ userId: uid, companyName: '', engineerIds: [] });
        }
    }
    else if (user.role === 'engineer') {
        if (!await Engineer_1.default.findOne({ userId: uid })) {
            await Engineer_1.default.create({ userId: uid, designation: '', department: '' });
        }
    }
}
/* ---------------------------- SIGNUP ---------------------------- */
async function signup(req, res) {
    try {
        const body = req.body || {};
        if (!body.email) {
            return res.status(200).json({ success: false, status: 400, message: 'email required' });
        }
        const email = String(body.email).toLowerCase().trim();
        const role = body.role || 'contractor';
        let user = await User_1.default.findOne({ email });
        /* -------- PASSWORD SIGNUP -------- */
        if (body.password) {
            if (user) {
                return res.status(200).json({ success: false, status: 400, message: 'user already exists' });
            }
            const hashed = await bcryptjs_1.default.hash(body.password, 10);
            user = await User_1.default.create({
                email,
                password: hashed,
                name: body.name || '',
                phone: body.phone || null,
                role,
                isActive: true,
                isDeleted: false,
                status: 'active',
                emailVerified: true
            });
            await ensureRoleDoc(user);
            const token = jsonwebtoken_1.default.sign({ sub: user._id.toString(), role: user.role }, config_1.default.jwt.secret, {
                expiresIn: config_1.default.jwt.expiresIn,
            });
            const { password, __v, createdAt, updatedAt, ...rest } = user.toObject();
            return res.status(200).json({
                success: true,
                status: 200,
                token,
                user: rest,
            });
        }
        /* -------- OTP SIGNUP -------- */
        if (!user) {
            user = await User_1.default.create({
                email,
                name: body.name || '',
                phone: body.phone || null,
                role,
                isActive: false,
                isDeleted: false,
                status: 'pending',
            });
        }
        else if (user.isActive) {
            return res.status(200).json({ success: false, status: 400, message: 'user already active, login instead' });
        }
        const digits = config_1.default.otp?.digits || 6;
        const ttl = config_1.default.otp?.ttlMinutes || 5;
        const code = Math.floor(Math.random() * (10 ** digits)).toString().padStart(digits, '0');
        const codeHash = crypto_1.default.createHash('sha256').update(code).digest('hex');
        const expiresAt = new Date(Date.now() + ttl * 60 * 1000);
        const otpDoc = await Otp_1.default.create({
            userId: user._id,
            codeHash,
            method: body.method || 'email',
            attempts: 0,
            used: false,
            expiresAt,
        });
        return res.status(200).json({
            success: true,
            status: 200,
            otpId: otpDoc._id,
            code, // dev only
        });
    }
    catch (err) {
        return res.status(200).json({
            success: false,
            status: 500,
            message: err.message || 'internal error'
        });
    }
}
/* ---------------------------- VERIFY EMAIL / OTP ---------------------------- */
async function verifyContact(req, res) {
    try {
        const { otpId, userId, code, email } = req.body;
        if (!code && !otpId) {
            return res.status(200).json({ success: false, status: 400, message: 'otp code required' });
        }
        let otpRec = null;
        if (otpId)
            otpRec = await Otp_1.default.findById(otpId);
        else if (userId)
            otpRec = await Otp_1.default.findOne({ userId, used: false }).sort({ createdAt: -1 });
        else if (email) {
            const u = await User_1.default.findOne({ email });
            if (!u)
                return res.status(200).json({ success: false, status: 400, message: 'user not found' });
            otpRec = await Otp_1.default.findOne({ userId: u._id, used: false }).sort({ createdAt: -1 });
        }
        if (!otpRec)
            return res.status(200).json({ success: false, status: 400, message: 'otp not found' });
        if (otpRec.expiresAt < new Date())
            return res.status(200).json({ success: false, status: 400, message: 'otp expired' });
        if (otpRec.attempts >= (config_1.default.otp?.maxAttempts || 5)) {
            return res.status(200).json({ success: false, status: 400, message: 'otp locked' });
        }
        const providedHash = crypto_1.default.createHash('sha256').update(String(code)).digest('hex');
        if (providedHash !== otpRec.codeHash) {
            otpRec.attempts++;
            await otpRec.save();
            return res.status(200).json({ success: false, status: 400, message: 'invalid otp' });
        }
        otpRec.used = true;
        await otpRec.save();
        const user = await User_1.default.findById(otpRec.userId);
        if (!user)
            return res.status(200).json({ success: false, status: 400, message: 'user missing' });
        user.isActive = true;
        user.status = 'active';
        user.emailVerified = true;
        if (otpRec.method === 'sms')
            user.phoneVerified = true;
        await user.save();
        await ensureRoleDoc(user);
        const token = jsonwebtoken_1.default.sign({ sub: user._id.toString(), role: user.role }, config_1.default.jwt.secret, {
            expiresIn: config_1.default.jwt.expiresIn,
        });
        const { password, __v, createdAt, updatedAt, ...rest } = user.toObject();
        return res.status(200).json({
            success: true,
            status: 200,
            token,
            user: rest,
        });
    }
    catch (err) {
        return res.status(200).json({
            success: false,
            status: 500,
            message: err.message
        });
    }
}
/* ---------------------------- LOGIN ---------------------------- */
async function login(req, res) {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(200).json({ success: false, status: 400, message: "email and password required", });
        }
        const emailNormalized = String(email).toLowerCase().trim();
        const user = await User_1.default.findOne({
            email: emailNormalized,
            isDeleted: false,
        })
            .select("+password email role isActive isDeleted name")
            .exec();
        if (!user) {
            return res.status(200).json({ success: false, status: 404, message: "user not found" });
        }
        const ok = await bcryptjs_1.default.compare(String(password), user.password || "");
        if (!ok) {
            return res.status(200).json({ success: false, status: 401, message: "invalid credentials" });
        }
        if (user.isDeleted) {
            return res.status(200).json({ success: false, status: 403, message: "account removed" });
        }
        if (!user.isActive) {
            return res.status(200).json({ success: false, status: 403, message: "account not active" });
        }
        await ensureRoleDoc(user);
        let roleDoc = null;
        if (user.role === "admin") {
            roleDoc = await Admin_1.default.findOne({ userId: user._id }).lean();
        }
        else if (user.role === "contractor") {
            roleDoc = await Contractor_1.default.findOne({ userId: user._id }).lean();
        }
        else if (user.role === "engineer") {
            roleDoc = await Engineer_1.default.findOne({ userId: user._id }).lean();
        }
        if (!roleDoc) {
            return res.status(200).json({ success: false, status: 500, message: `Role document for ${user.role} not found`, });
        }
        const token = jsonwebtoken_1.default.sign({ sub: user._id.toString(), role: user.role }, config_1.default.jwt.secret, { expiresIn: config_1.default.jwt.expiresIn });
        return res.status(200).json({
            success: true,
            status: 200,
            role: user.role,
            token,
            data: roleDoc,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(200).json({ success: false, status: 500, message: err.message });
    }
}
