import mongoose, { Schema, Document } from "mongoose";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  CONTRACTOR = "contractor"
}

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  isDeleted: boolean;
  isVerified: boolean;
  permissions?: string[];
  lastLoginAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
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
    permissions: [{ type: String }],
    lastLoginAt: Date
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);