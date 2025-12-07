import mongoose from 'mongoose';

const EngineerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contractor',
      required: false,
      index: true,
    },
    designation: { type: String },
    department: { type: String },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Engineer || mongoose.model('Engineer', EngineerSchema);
