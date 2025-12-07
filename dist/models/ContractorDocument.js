"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ContractorDocumentSchema = new mongoose_1.default.Schema({
    contractorId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Contractor', required: true, index: true },
    title: { type: String },
    filePath: { type: String },
    metadata: { type: Object },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    uploadedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
exports.default = mongoose_1.default.models.ContractorDocument || mongoose_1.default.model('ContractorDocument', ContractorDocumentSchema);
