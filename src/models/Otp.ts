import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    identifier: { type: String, index: true }, // email || phone
    codeHash: { type: String, required: true },
    method: { type: String, enum: ["email", "sms"], default: "email" },
    purpose: {
      type: String,
      enum: ["auth", "verify_email", "verify_phone"],
      default: "auth",
      required: true
    },
    attempts: { type: Number, default: 0 },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ userId: 1, purpose: 1, expiresAt: -1 });
OtpSchema.index({ identifier: 1, purpose: 1, expiresAt: -1 });

export default mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
