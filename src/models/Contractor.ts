import mongoose from 'mongoose';

const ContractorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    companyName: { type: String },
    gstNumber: { type: String },
    contactPerson: { type: String },
    contactNumber: { type: String },
    engineerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Engineer' }],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Contractor || mongoose.model('Contractor', ContractorSchema);
