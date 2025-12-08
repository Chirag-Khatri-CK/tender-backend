import Contractor from "../models/Contractor";
import { Types } from "mongoose";
import { updateUserAndSplit } from "./user.controller";
import { AppError } from "../utils/AppError";

export async function createContractorController(payload: any) {
  const doc = await Contractor.create(payload);
  return { ok: true, contractor: doc };
}

export async function updateContractorController(
  id: string,
  body: Record<string, any>
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid Contractor ID");
  }

  const contractor = await Contractor.findById(id).exec();
  if (!contractor) {
    throw new AppError(404, "Contractor not found");
  }

  const { restBody } = await updateUserAndSplit({
    userId: contractor.userId.toString(),
    body,
  });

  if (Object.keys(restBody).length > 0) {
    Object.assign(contractor, restBody);
    await contractor.save();
  }

  const fresh = await Contractor.findById(id).lean();
  return { contractor: fresh };
}

export async function getContractorController(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid Contractor ID");
  }

  const contractor = await Contractor.findById(id).lean();
  if (!contractor) throw new AppError(404, "not found");

  return { contractor };
}
