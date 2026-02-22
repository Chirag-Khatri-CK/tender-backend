import mongoose from "mongoose";

const DirectorSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        fatherOrSpouseName: {
            type: String,
            trim: true
        },

        dateOfBirth: {
            type: Date
        },

        designation: {
            type: String,
            trim: true
        },

        address: {
            type: String
        },

        din: { //Director Identification Number.
            type: String,
            match: /^[0-9]{8}$/,
            sparse: true
        },

        pan: {
            type: String,
            uppercase: true,
            match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
            sparse: true
        },

        aadhar: {
            type: String,
            match: /^[0-9]{12}$/,
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

export default mongoose.models.Director || mongoose.model("Director", DirectorSchema);
