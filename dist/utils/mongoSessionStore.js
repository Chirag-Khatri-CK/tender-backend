"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionKey = void 0;
exports.setSessionKey = setSessionKey;
exports.getSessionKey = getSessionKey;
exports.deleteSessionKey = deleteSessionKey;
const mongoose_1 = __importDefault(require("mongoose"));
const SessionKeySchema = new mongoose_1.default.Schema({
    token: { type: String, required: true, unique: true, index: true },
    encKeyBase64: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true }
}, { timestamps: true });
exports.SessionKey = mongoose_1.default.models.SessionKey || mongoose_1.default.model('SessionKey', SessionKeySchema);
async function setSessionKey(token, encKeyBase64, ttlSeconds) {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    await exports.SessionKey.findOneAndUpdate({ token }, { encKeyBase64, expiresAt }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
}
async function getSessionKey(token) {
    if (!token)
        return null;
    const rec = await exports.SessionKey.findOne({ token }).exec();
    if (!rec)
        return null;
    if (rec.expiresAt < new Date()) {
        await exports.SessionKey.deleteOne({ token }).exec();
        return null;
    }
    return rec.encKeyBase64;
}
async function deleteSessionKey(token) {
    await exports.SessionKey.deleteOne({ token }).exec();
}
