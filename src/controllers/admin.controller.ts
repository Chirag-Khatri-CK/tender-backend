import Admin from "../models/Admin";
import { Types } from "mongoose";
import { updateUserAndSplit } from "./user.controller";
import { AppError } from "../utils/AppError";
import { getUserWithRole } from "../utils/authToken";

export async function createAdminController(
  userId: string,
  permissions: string[] = []
) {
  if (!userId) throw new AppError(400, "userId required");
  const doc = await Admin.create({ userId, permissions });
  return { ok: true, admin: doc };
}

export async function updateAdminController(
  id: string,
  body: Record<string, any>
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid Admin ID");
  }

  const admin = await Admin.findById(id);
  if (!admin) {
    throw new AppError(404, "Admin not found");
  }

  const { restBody } = await updateUserAndSplit({
    userId: admin.userId.toString(),
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

  const admin = await getUserWithRole(Admin, id);
  if (!admin) {
    throw new AppError(404, "Admin not found");
  }

  return {
    success: true,
    message,
    data: admin
  };
}
