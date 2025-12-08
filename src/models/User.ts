import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      // unique: true,
      sparse: true,
      trim: true,
    },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ['admin', 'contractor', 'engineer'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended'],
      default: 'pending',
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    name: { type: String },
    isPremiumMember: { type: Boolean, default: false },
    subscribeAt: { type: Date },
    premiumExpiresAt: { type: Date },
    premiumPlan: { type: String, enum: ["MONTHLY", "YEARLY", "LIFETIME"], default: null },
  },
  { timestamps: true }
);

UserSchema.index({ _id: 1, isDeleted: 1 });
UserSchema.index({ email: 1, isDeleted: 1 });
UserSchema.index({ isActive: 1, isDeleted: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
