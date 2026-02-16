import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    permissions: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AdminSchema.index({ userId: 1 });
AdminSchema.index({ isActive: 1, isDeleted: 1 });
AdminSchema.index({ createdAt: -1 });
AdminSchema.index({ permissions: 1 });

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
