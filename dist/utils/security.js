"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordIsValid = exports.verifyPassword = exports.hashPassword = exports.verifyOtpHash = exports.hashOtp = exports.generateOtp = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateOtp = () => {
    return ('' + Math.floor(100000 + Math.random() * 900000));
};
exports.generateOtp = generateOtp;
const hashOtp = async (otp) => {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(otp, salt);
};
exports.hashOtp = hashOtp;
const verifyOtpHash = async (otp, otpHash) => {
    return bcryptjs_1.default.compare(otp, otpHash);
};
exports.verifyOtpHash = verifyOtpHash;
const hashPassword = async (password) => {
    const salt = await bcryptjs_1.default.genSalt(12);
    return bcryptjs_1.default.hash(password, salt);
};
exports.hashPassword = hashPassword;
const verifyPassword = async (password, hash) => {
    return bcryptjs_1.default.compare(password, hash);
};
exports.verifyPassword = verifyPassword;
// password validator: 8-32 chars, no spaces, at least one lower, one upper, one number
const passwordIsValid = (password) => {
    if (!password)
        return { success: false, reason: 'Password required' };
    if (password.length < 8 || password.length > 32)
        return { success: false, reason: 'Password must be 8-32 characters' };
    if (password.includes(' '))
        return { success: false, reason: 'Password must not contain spaces' };
    if (!/[a-z]/.test(password))
        return { success: false, reason: 'Password must include a lowercase letter' };
    if (!/[A-Z]/.test(password))
        return { success: false, reason: 'Password must include an uppercase letter' };
    if (!/[0-9]/.test(password))
        return { success: false, reason: 'Password must include a number' };
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
        return { success: false, reason: 'Password must include a special character' };
    return { success: true };
};
exports.passwordIsValid = passwordIsValid;
