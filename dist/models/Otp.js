"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const OtpSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    codeHash: { type: String, required: true },
    method: { type: String, enum: ['email', 'sms'], default: 'email' },
    attempts: { type: Number, default: 0 },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });
OtpSchema.index({ userId: 1, expiresAt: 1 });
exports.default = mongoose_1.default.models.Otp || mongoose_1.default.model('Otp', OtpSchema);
