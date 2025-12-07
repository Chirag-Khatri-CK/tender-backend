"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ContractorSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    companyName: { type: String },
    gstNumber: { type: String },
    contactPerson: { type: String },
    contactNumber: { type: String },
    engineerIds: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Engineer' }],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
}, { timestamps: true });
exports.default = mongoose_1.default.models.Contractor || mongoose_1.default.model('Contractor', ContractorSchema);
