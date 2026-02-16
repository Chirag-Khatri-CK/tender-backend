// models/Tender.js
import mongoose, { Schema } from 'mongoose';

const DateRawFormattedSchema = new mongoose.Schema({
    raw: { type: String, default: "" },        // original epoch string if present
    formatted: { type: String, default: "" },
    asDate: { type: Date, default: null }      // converted Date for queries
}, { _id: false });

const CategorySchema = new mongoose.Schema({
    label: String,
    categoryDescription: String,
    bidPartList: [Number],
    maxAssociateBidpart: Number
}, { _id: false });

const AttachmentSchema = new mongoose.Schema({
    label: String,
    fileName: String,
    filePath: String,
    downloadUrl: String
}, { _id: false });

const RequiredAttachmentSchema = new mongoose.Schema({
    supportingDocument: String,
    mandatory: { type: String, default: "N" },
    allowExemption: { type: String, default: "N" },
    group: String,
    evaluationType: String
}, { _id: false });

const BoqItemSchema = new mongoose.Schema({
    itemCode: String,
    itemName: String,
    uom: String,
    quantity: Number,
    estimatedCost: Number,
    sorTotal: Schema.Types.Mixed,
    attachment: AttachmentSchema,
    mandatoryItem: String
}, { _id: false });

const AuthoritySchema = new mongoose.Schema({
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
    orgHirarchy: Schema.Types.Mixed
}, { _id: false });

// Main Tender schema
const TenderSchema = new mongoose.Schema({
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
    slug: { type: String, default: "" },
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
    status: { type: String, enum: ["DRAFT", "PUBLISHED", "CANCELLED", "CLOSED", "ARCHIVED"], default: "PUBLISHED" },
    cancelReason: { type: String, default: "" },
    cancelTime: { type: Date, default: null },
    tenderId: { type: String, default: "" },
}, {
    timestamps: true
});

// Index suggestions
TenderSchema.index({ "generalInformation.systemTenderNo": 1 }, { unique: false });
TenderSchema.index({ "generalInformation.tenderReferenceNo": 1 });

export default mongoose.model("Tender", TenderSchema);
