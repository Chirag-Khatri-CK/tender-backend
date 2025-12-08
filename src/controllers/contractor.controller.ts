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

export async function listContractorsController(query: any) {
  const {
    q,
    sort = "createdAt",
    limit = "20",
    skip,
    page = "1",
    isActive,
    isDeleted,
  } = query as Record<string, string>;

  const match: any = {};

  if (isDeleted !== undefined) {
    match.isDeleted = String(isDeleted).toLowerCase() === "true";
  } else {
    match.isDeleted = false;
  }

  if (isActive !== undefined) {
    match.isActive = String(isActive).toLowerCase() === "true";
  }

  // Search by q: companyName, gstNumber, contactPerson, contactNumber
  if (q) {
    const re = new RegExp(String(q).trim(), "i");
    match.$or = [
      { companyName: re },
      { gstNumber: re },
      { contactPerson: re },
      { contactNumber: re },
    ];
  }

  let sortDirection = -1;
  if (sort) {
    const dir = String(sort).trim().toLowerCase();
    if (dir === "asc") sortDirection = 1;
    if (dir === "desc") sortDirection = -1;
  }

  const sortObj = { createdAt: sortDirection };

  const numericLimit = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
  let numericSkip = 0;

  if (skip !== undefined) {
    numericSkip = Math.max(0, parseInt(skip as string, 10) || 0);
  } else if (page !== undefined) {
    const numericPage = Math.max(1, parseInt(page as string, 10) || 1);
    numericSkip = (numericPage - 1) * numericLimit;
  }

  const pipeline: any[] = [
    { $match: match },
    { $sort: sortObj },
    {
      $facet: {
        items: [{ $skip: numericSkip }, { $limit: numericLimit }],
        total: [{ $count: "count" }],
      },
    },
  ];

  const aggResult = await Contractor.aggregate(pipeline).exec();
  const facet = aggResult[0] || { items: [], total: [] };

  const items = facet.items || [];
  const total = Array.isArray(facet.total) && facet.total[0] && facet.total[0].count ? facet.total[0].count : 0;

  const currentPage =
    skip !== undefined
      ? Math.floor(numericSkip / numericLimit) + 1
      : Math.max(1, parseInt(page as string, 10) || 1);

  return {
    success: true,
    data: items,
    meta: {
      total,
      limit: numericLimit,
      skip: numericSkip,
      page: currentPage,
    },
  };
}