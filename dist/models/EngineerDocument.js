"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const EngineerDocumentSchema = new mongoose_1.default.Schema({
    engineerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Engineer', required: true, index: true },
    title: { type: String },
    filePath: { type: String },
    metadata: { type: Object },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    uploadedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
exports.default = mongoose_1.default.models.EngineerDocument || mongoose_1.default.model('EngineerDocument', EngineerDocumentSchema);
