import { Types } from "mongoose";
import User, { UserRole } from "../models/core/User";
import { updateUserAndSplit } from "./user.controller";
import { AppError } from "../utils/AppError";

/* =========================================================
   CREATE CONTRACTOR
========================================================= */
export async function createContractorController(userId: string) {
  if (!Types.ObjectId.isValid(userId)) throw new AppError(400, "Invalid userId");

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");

  if (user.role === UserRole.CONTRACTOR) throw new AppError(400, "Already contractor");

  user.role = UserRole.CONTRACTOR;
  await user.save();

  return { ok: true, contractor: user };
}


/* =========================================================
   UPDATE CONTRACTOR
========================================================= */
export async function updateContractorController(
  id: string,
  body: Record<string, any>
) {
  if (!Types.ObjectId.isValid(id)) throw new AppError(400, "Invalid Contractor ID");

  const user = await User.findOne({
    _id: id,
    role: UserRole.CONTRACTOR
  });

  if (!user) throw new AppError(404, "Contractor not found");

  const { restBody } = await updateUserAndSplit({
    userId: id,
    body,
  });

  if (Object.keys(restBody).length > 0) {
    Object.assign(user, restBody);
    await user.save();
  }

  return getContractorController(id, "Contractor updated successfully");
}


/* =========================================================
   GET CONTRACTOR
========================================================= */
export async function getContractorController(
  id: string,
  message?: string
) {
  if (!Types.ObjectId.isValid(id)) throw new AppError(400, "Invalid Contractor ID");

  const contractor = await User.findOne({
    _id: id,
    role: UserRole.CONTRACTOR,
    isDeleted: false,
    isActive: true
  }).select("-password -__v");

  if (!contractor) throw new AppError(404, "Contractor not found");

  return {
    success: true,
    message: message ?? "Contractor fetched successfully",
    data: contractor
  };
}


/* =========================================================
   LIST CONTRACTORS
========================================================= */
export async function listContractorsController(query: any) {
  const {
    q,
    limit = "20",
    skip,
    page = "1",
    isActive = "true",
    isDeleted,
    isPremium,
    sort = "desc"
  } = query as Record<string, string>;

  const match: any = {
    role: UserRole.CONTRACTOR
  };

  if (isDeleted !== undefined)
    match.isDeleted = isDeleted === "true";
  else
    match.isDeleted = false;

  if (isActive !== undefined)
    match.isActive = isActive === "true";

  if (isPremium === "true")
    match.isPremiumMember = true;

  if (isPremium === "false")
    match.isPremiumMember = false;

  if (q) {
    const re = new RegExp(q.trim(), "i");
    match.$or = [
      { name: re },
      { email: re },
      { phone: re }
    ];
  }

  const numericLimit = Math.min(100, Math.max(1, Number(limit) || 20));

  let numericSkip = 0;

  if (skip !== undefined)
    numericSkip = Math.max(0, Number(skip) || 0);
  else
    numericSkip = (Math.max(1, Number(page) || 1) - 1) * numericLimit;

  const sortDir = sort === "asc" ? 1 : -1;

  const [items, total] = await Promise.all([
    User.find(match)
      .select("-password -__v")
      .sort({ createdAt: sortDir })
      .skip(numericSkip)
      .limit(numericLimit)
      .lean(),

    User.countDocuments(match)
  ]);

  return {
    success: true,
    data: items,
    message: "Contractors list fetched successfully",
    meta: {
      total,
      limit: numericLimit,
      skip: numericSkip,
      page: Math.floor(numericSkip / numericLimit) + 1
    }
  };
}