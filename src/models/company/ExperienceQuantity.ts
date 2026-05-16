import mongoose from "mongoose";

const ExperienceQuantitySchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },

        agreementNo: {
            type: String,
            trim: true,
            required: true
        },

        qtyExecutedDescription: {
            type: String,
            trim: true,
            maxlength: 500
        },

        qtyExecuted: {
            type: Number,
            required: true,
            min: 0
        },

        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    { timestamps: true, versionKey: false }
);


ExperienceQuantitySchema.index({ companyId: 1, agreementNo: 1, isDeleted: 1 }, { unique: true });


export default mongoose.models.ExperienceQuantity || mongoose.model("ExperienceQuantity", ExperienceQuantitySchema);
