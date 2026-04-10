import mongoose, { Schema, Document } from "mongoose";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  CONTRACTOR = "contractor"
}

export interface IUser {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  isDeleted: boolean;
  isVerified: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  permissions?: string[];
  lastLoginAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
      index: true
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    permissions: [{ type: String }],
    lastLoginAt: Date
  },
  { timestamps: true }
);

UserSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $exists: true } } }
);

UserSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $exists: true } } }
);


UserSchema.index({ role: 1, isDeleted: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ isDeleted: 1, isActive: 1 });

export default mongoose.model<IUser>("User", UserSchema);