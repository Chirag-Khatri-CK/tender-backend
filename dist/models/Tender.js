"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// models/Tender.js
const mongoose_1 = __importStar(require("mongoose"));
// Sub-schemas
const DateRawFormattedSchema = new mongoose_1.default.Schema({
    raw: { type: String, default: "" }, // original epoch string if present
    formatted: { type: String, default: "" }, // human string
    asDate: { type: Date, default: null } // converted Date for queries
}, { _id: false });
const CategorySchema = new mongoose_1.default.Schema({
    label: String,
    categoryDescription: String,
    bidPartList: [Number],
    maxAssociateBidpart: Number
}, { _id: false });
const AttachmentSchema = new mongoose_1.default.Schema({
    label: String,
    fileName: String,
    filePath: String,
    downloadUrl: String
}, { _id: false });
const RequiredAttachmentSchema = new mongoose_1.default.Schema({
    supportingDocument: String,
    mandatory: { type: String, default: "N" },
    allowExemption: { type: String, default: "N" },
    group: String,
    evaluationType: String
}, { _id: false });
const BoqItemSchema = new mongoose_1.default.Schema({
    itemCode: String,
    itemName: String,
    uom: String,
    quantity: Number,
    estimatedCost: Number,
    sorTotal: mongoose_1.Schema.Types.Mixed,
    attachment: AttachmentSchema,
    mandatoryItem: String
}, { _id: false });
const AuthoritySchema = new mongoose_1.default.Schema({
    tenderIssuingAuthorityId: Number,
    tenderIssuingAuthorityName: String,
    tenderIssuingAuthorityDesignation: String,
    organizationName: String,
    organizationCode: String,
    address: String,
    email: String,
    contactNo: String,
    identifystring: String,
    parentId: Number,
    createid: Number,
    createdate: Number,
    updateid: Number,
    updatedate: Number,
    isActive: Number,
    orgHirarchy: mongoose_1.Schema.Types.Mixed
}, { _id: false });
// Main Tender schema
const TenderSchema = new mongoose_1.default.Schema({
    generalInformation: {
        bidParts: Number,
        category: CategorySchema,
        tenderCreator: String,
        organizationHierarchy: [String],
        systemTenderNo: { type: String, index: true }, // index for fast lookup
        tenderReferenceNo: { type: String, index: true },
        tenderTitle: String,
        procurementCategory: String,
        tenderCurrency: String,
        biddingCurrency: String,
        tenderType: String,
        estimatedValueVisibilityFlag: String,
        minimumNumberOfBids: Number,
        rankingSequence: String,
        offerValidityInDays: Number,
        tenderIssuingAuthorityName: String,
        tenderApprovingAuthorityName: String,
        detailedDescription: String,
        shortTenderReason: String,
        NIT: String,
        createdate: { type: Number, default: null },
        createdOn: DateRawFormattedSchema
    },
    dateSchedule: {
        bidSubmissionStartDate: DateRawFormattedSchema,
        bidSubmissionDueDate: DateRawFormattedSchema,
        bidOpenDate: DateRawFormattedSchema,
        physicalDocSubmissionEndDate: DateRawFormattedSchema
    },
    preBidDiscussion: {
        discussionType: String,
        meetingStartDate: DateRawFormattedSchema,
        meetingEndDate: DateRawFormattedSchema,
        venue: String,
        remarks: String
    },
    payments: [{
            paymentType: String,
            amount: Number,
            paymentMode: String,
            paymentCurrency: String,
            exemptionAllowed: String,
            exemptionReason: String
        }],
    generalParticulars: [{
            label: String,
            value: String
        }],
    termsAndConditions: [{
            clauseNo: String,
            specification: String,
            attachment: String
        }],
    attachments: [AttachmentSchema],
    requiredAttachments: [RequiredAttachmentSchema],
    boq: [BoqItemSchema],
    tenderIssuingAuthority: AuthoritySchema,
    tenderApprovingAuthority: AuthoritySchema,
    meta: {
        createdBy: String,
        createdOn: DateRawFormattedSchema,
        source: String,
        sourceUrl: String
    },
    isDeleted: { type: Boolean, default: false },
    adminId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Admin", default: null },
    status: { type: String, enum: ["DRAFT", "ACTIVE", "CANCELLED", "CLOSED", "ARCHIVED"], default: "ACTIVE" },
    cancelReason: { type: String, default: "" },
    cancelTime: { type: Date, default: null },
    tenderId: { type: String, default: "" },
}, {
    timestamps: true
});
// Index suggestions
TenderSchema.index({ "generalInformation.systemTenderNo": 1 }, { unique: false });
TenderSchema.index({ "generalInformation.tenderReferenceNo": 1 });
exports.default = mongoose_1.default.model("Tender", TenderSchema);
