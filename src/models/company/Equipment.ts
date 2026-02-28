import mongoose from "mongoose";

const EquipmentSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },

        toolName: {
            type: String,
            required: true,
            trim: true
        },

        purchaseDate: {
            type: Date
        },

        purchaseFrom: {
            type: String,
            trim: true
        },

        invoiceNo: {
            type: String,
            trim: true
        },

        ownerName: {
            type: String,
            trim: true
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

export default mongoose.models.Equipment || mongoose.model("Equipment", EquipmentSchema);
