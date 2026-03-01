import mongoose from "mongoose";

const BidSchema = new mongoose.Schema({
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
    employerName: {
        type: String,
        required: true,
        trim: true
    },
    tenderValue: {
        type: Number
    },

    isDeleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

BidSchema.index({ companyId: 1, workName: 1, isDeleted: 1 }, { unique: true });

export default mongoose.models.Bid || mongoose.model("Bid", BidSchema);