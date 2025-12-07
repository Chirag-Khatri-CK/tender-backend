import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    codeHash: { type: String, required: true },
    method: { type: String, enum: ['email','sms'], default: 'email' },
    attempts: { type: Number, default: 0 },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

OtpSchema.index({ userId: 1, expiresAt: 1 });

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);
