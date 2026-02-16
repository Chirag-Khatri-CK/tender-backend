import mongoose from "mongoose";

const ExperienceCertificateSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },

        workName: {
            type: String,
            trim: true,
            required: true,
            maxlength: 200
        },

        employerName: {
            type: String,
            trim: true,
            maxlength: 200
        },

        agreementValue: {
            type: Number,
            default: 0,
            min: 0
        },

        workDoneValue: {
            type: Number,
            default: 0,
            min: 0
        },

        agreementNo: {
            type: String,
            trim: true,
            required: true
        },

        completionDate: {
            type: Date
        },

        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    {
        timestamps: true,
    }
);

ExperienceCertificateSchema.index( { companyId: 1, agreementNo: 1, isDeleted: 1 },{ unique: true });
ExperienceCertificateSchema.index({ companyId: 1, createdAt: -1 });

export default mongoose.models.ExperienceCertificate || mongoose.model("ExperienceCertificate", ExperienceCertificateSchema);
