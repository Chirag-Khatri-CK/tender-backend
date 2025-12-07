"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = exports.pad = void 0;
exports.getNextSequence = getNextSequence;
exports.getNextDailySequence = getNextDailySequence;
exports.generateUniqueSlug = generateUniqueSlug;
// utils/sequence.ts
const Counter_1 = __importDefault(require("../models/Counter"));
const pad = (n, size = 2) => String(n).padStart(size, "0");
exports.pad = pad;
async function getNextSequence(key) {
    const counter = await Counter_1.default.findByIdAndUpdate(key, { $inc: { seq: 1 } }, { new: true, upsert: true, setDefaultsOnInsert: true }).lean();
    return counter.seq;
}
async function getNextDailySequence(key) {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = (0, exports.pad)(now.getMonth() + 1);
    const DD = (0, exports.pad)(now.getDate());
    const counterKey = `${key}_${YYYY}${MM}${DD}`;
    const counter = await Counter_1.default.findByIdAndUpdate(counterKey, { $inc: { seq: 1 } }, { new: true, upsert: true, setDefaultsOnInsert: true }).lean();
    return counter.seq;
}
const slugify = (text = "") => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 80);
exports.slugify = slugify;
async function generateUniqueSlug(base, model, suffix) {
    let slug = `${(0, exports.slugify)(base)}-${suffix}`.toLowerCase();
    let attempt = 1;
    while (await model.exists({ slug })) {
        slug = `${(0, exports.slugify)(base)}-${suffix}-${attempt++}`.toLowerCase();
    }
    return slug;
}
