import mongoose from "mongoose";

const AuditSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },

        isDeleted: {
            type: Boolean,
            default: false
        },

        financialYear: {  // e.g. 2023-24
            type: String,
            required: true,
            trim: true
        },

        turnover: {
            type: Number,
            min: 0
        },

        udin: {
            type: String,
            trim: true
        },
    },
    { timestamps: true }
);


AuditSchema.index({ companyId: 1, financialYear: 1 }, { unique: true });
AuditSchema.index({ companyId: 1, createdAt: -1 });

export default mongoose.models.Audit || mongoose.model("Audit", AuditSchema);