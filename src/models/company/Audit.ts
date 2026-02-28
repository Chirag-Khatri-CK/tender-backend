import mongoose from "mongoose";

const AuditSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
        index: true
    },

    financialYear: {  // e.g. 2023-24
        type: String,
        required: true
    },
    turnover: {
        type: Number, min: 0
    },
    udin: {
        type: String, trim: true

    }
}, { timestamps: true });

export default mongoose.models.Audit || mongoose.model("Audit", AuditSchema);

