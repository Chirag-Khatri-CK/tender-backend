import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },

        registeredAddress: {
            type: String,
            required: true
        },

        corporateAddress: {
            type: String
        },

        cin: {
            type: String,
            uppercase: true,
            match: /^[A-Z0-9]{21}$/,
            sparse: true
        },

        gstin: {
            type: String,
            uppercase: true,
            match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/,
            sparse: true
        },

        pan: {
            type: String,
            uppercase: true,
            match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
            sparse: true
        },

        epf: {
            type: String,
            sparse: true
        },

        esic: {
            type: String,
            sparse: true
        },

        isActive: {
            type: Boolean,
            default: true
        },

        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default mongoose.models.Company || mongoose.model("Company", CompanySchema);
