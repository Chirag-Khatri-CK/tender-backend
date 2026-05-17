import mongoose from "mongoose";
import slugify from "slugify";

const CompanySchema = new mongoose.Schema(
    {
        createdBy: {
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

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
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
        },

        profileStatus: {
            type: String,
            enum: ["draft", "completed"],
            default: "completed"
        },

        profileCompletion: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);


CompanySchema.pre("validate", async function (next) {
    if (!this.name) return next();

    // only regenerate if new or name changed
    if (!this.isModified("name")) return next();

    const baseSlug = slugify(this.name, { lower: true, strict: true, trim: true });

    let slug = baseSlug;
    let count = 1;

    while (
        await mongoose.models.Company.findOne({
            slug,
            _id: { $ne: this._id }
        })
    ) {
        slug = `${baseSlug}-${count++}`;
    }

    this.slug = slug;

    next();
});

export default mongoose.models.Company || mongoose.model("Company", CompanySchema);