"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const EngineerSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    contractorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Contractor',
        required: false,
        index: true,
    },
    designation: { type: String },
    department: { type: String },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
}, { timestamps: true });
exports.default = mongoose_1.default.models.Engineer || mongoose_1.default.model('Engineer', EngineerSchema);
