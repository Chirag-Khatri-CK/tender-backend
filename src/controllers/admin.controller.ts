import User, { UserRole } from "../models/core/User";
import { Types } from "mongoose";
import { AppError } from "../utils/AppError";
import { getUserWithRole } from "../utils/authToken";

export async function createAdminController(
  userId: string,
  permissions: string[] = []
) {
  if (!userId) throw new AppError(400, "userId required");

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");

  user.role = UserRole.ADMIN;
  user.permissions = permissions;

  await user.save();

  return {
    ok: true,
    admin: user
  };
}

export async function updateAdminController(
  id: string,
  body: Record<string, any>
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid Admin ID");
  }

  const admin = await User.findOne({ _id: id, role: "admin", isDeleted: false });

  if (!admin) {
    throw new AppError(404, "Admin not found");
  }

  const incoming = { ...body };
  delete incoming._id;
  delete incoming.isDeleted;
  delete incoming.role;
  delete incoming.password;

  await User.findOneAndUpdate(
    { _id: id, role: "admin", isDeleted: false },
    incoming,
    { returnDocument: 'after' }
  );

  return getAdminController(id, "Admin updated successfully");
}

export async function getAdminController(
  id: string,
  message = "Admin fetched successfully"
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid Admin ID");
  }

  const admin = await getUserWithRole(id, "admin");
  if (!admin) {
    throw new AppError(404, "Admin not found");
  }

  return {
    success: true,
    message,
    data: admin
  };
}
