import mongoose from "mongoose";

const ExistingCommitmentSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },

        workName: {
            type: String,
            required: true,
            trim: true
        },

        agreementNo: {
            type: String,
            required: true,
            trim: true
        },

        employerName: {
            type: String,
            trim: true
        },

        agreementValue: {
            type: Number,
            min: 0
        },

        paymentReceived: {
            type: Number,
            min: 0
        },

        completionPeriod: {
            type: String,
            trim: true
        },

        remarks: {
            type: String,
            maxlength: 500
        }
    },
    { timestamps: true }
);

ExistingCommitmentSchema.index({ companyId: 1, isDeleted: 1 }, { unique: true });
ExistingCommitmentSchema.index({ companyId: 1, agreementNo: 1 }, { unique: true });

export default mongoose.models.ExistingCommitment || mongoose.model("ExistingCommitment", ExistingCommitmentSchema);
