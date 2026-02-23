import User, { UserRole } from "../models/core/User";
import { Types } from "mongoose";
import { updateUserAndSplit } from "./user.controller";
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

  const admin = await User.findOne({ _id: id, role: "admin" });
  if (!admin) {
    throw new AppError(404, "Admin not found");
  }

  const { restBody } = await updateUserAndSplit({
    userId: admin._id.toString(),
    body
  });

  if (Object.keys(restBody).length > 0) {
    Object.assign(admin, restBody);
    await admin.save();
  }

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
