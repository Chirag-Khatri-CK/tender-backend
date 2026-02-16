import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },

        department: {
            type: String,
            trim: true,
            required: true
        },

        registrationNo: {
            type: String,
            trim: true,
            required: true
        },

        issueDate: {
            type: Date,
            required: true
        },

        expiryDate: {
            type: Date,
            required: true
        },

        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    { timestamps: true, versionKey: false }
);

RegistrationSchema.index({ companyId: 1, registrationNo: 1, isDeleted: 1 },{ unique: true });

export default mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);
