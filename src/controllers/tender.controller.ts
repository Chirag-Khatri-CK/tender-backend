// controllers/tender.controller.ts
import mongoose from "mongoose";
import Tender from "../models/Tender";
import {
  getNextDailySequence,
  generateUniqueSlug,
  pad,
} from "../utils/commonUtil";
import { AppError } from "../utils/AppError";

export async function generateTenderIds(title: string) {
  const seq = await getNextDailySequence("tender");
  const now = new Date();

  const YYYY = now.getFullYear();
  const MM = pad(now.getMonth() + 1);
  const DD = pad(now.getDate());

  const tenderId = `TED-${YYYY}${MM}${DD}-${pad(seq, 4)}`;
  const slug = await generateUniqueSlug(title, Tender, tenderId);
  return { tenderId, slug };
}

/* ---------------------------- CREATE ---------------------------- */
export async function createTenderController(body: any) {
  const title =
    body?.generalInformation?.tenderTitle ||
    body?.generalInformation?.detailedDescription ||
    "untitled-tender";

  const { tenderId, slug } = await generateTenderIds(title);

  body.tenderId = body.tenderId ?? tenderId;
  body.slug = slug;
  body.isDeleted = body.isDeleted ?? false;
  body.isActive = body.isActive ?? true;
  body.status = body.status ?? "ACTIVE";
  body.meta = body.meta ?? {};
  body.meta.createdBy = body.meta.createdBy ?? "SYSTEM";
  body.meta.createdOn =
    body.meta.createdOn ?? {
      raw: String(Date.now()),
      formatted: new Date().toISOString(),
    };

  const tender = await Tender.create(body);

  return {
    success: true,
    message: "Tender created successfully",
    data: {
      tenderId: tender.tenderId,
      slug: tender.slug,
      _id: tender._id,
    },
  };
}

/* ---------------------------- GET ONE ---------------------------- */
export async function getTenderController(params: {
  id?: string;
  slug?: string;
  tenderId?: string;
  systemTenderNo?: string;
}) {
  const { id, slug, tenderId, systemTenderNo } = params;

  let query: any = null;

  if (slug && typeof slug === "string") {
    query = { slug: slug.toLowerCase() };
  } else if (tenderId && typeof tenderId === "string") {
    query = { tenderId };
  } else if (systemTenderNo && typeof systemTenderNo === "string") {
    query = { "generalInformation.systemTenderNo": systemTenderNo };
  } else if (id && mongoose.Types.ObjectId.isValid(id)) {
    query = { _id: id };
  } else {
    throw new AppError(
      400,
      "Provide slug or tenderId or systemTenderNo or a valid id"
    );
  }

  const tender = await Tender.findOne(query).lean();
  if (!tender) throw new AppError(404, "Tender not found");

  return { success: true, data: tender };
}

export async function listTendersController(query: any) {
  const {
    procurementCategory,
    sortField = "createdAt",
    sortOrder = "desc",
    limit = "20",
    skip,
    page = "1",
    status,
    q,
  } = query as Record<string, string>;

  const match: any = { isDeleted: false };

  if (procurementCategory) match["generalInformation.procurementCategory"] = procurementCategory;
  if (status) match["status"] = status;

  if (q) {
    const trimmed = String(q).trim();
    // $text index = fast. Regex fallback only for very short terms.
    if (trimmed.length >= 3) {
      match.$text = { $search: trimmed };
    } else {
      const re = new RegExp(trimmed, "i");
      match.$or = [
        { "generalInformation.tenderTitle": re },
        { "generalInformation.tenderReferenceNo": re },
        { tenderId: re },
        { slug: re },
      ];
    }
  }

  const allowedSortFields: Record<string, string> = {
    createdAt: "createdAt",
    endDate: "dateSchedule.bidSubmissionDueDate.raw",
    tenderId: "externalSystemDisplayTenderId",
  };
  const field = allowedSortFields[sortField] ?? "createdAt";
  const sortDirection = sortOrder === "asc" ? 1 : -1;
  const sortObj: any = { [field]: sortDirection };

  const numericLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  let numericSkip = 0;

  if (skip !== undefined) {
    numericSkip = Math.max(0, parseInt(skip, 10) || 0);
  } else {
    const numericPage = Math.max(1, parseInt(page, 10) || 1);
    numericSkip = (numericPage - 1) * numericLimit;
  }

  const [total, items] = await Promise.all([
    Tender.countDocuments(match),
    Tender.aggregate([
      { $match: match },
      { $sort: sortObj },
      { $skip: numericSkip },
      { $limit: numericLimit },
      {
        $project: {
          _id: 1,
          externalSystemDisplayTenderId: 1,
          description: "$generalInformation.detailedDescription",
          tenderReferenceNo: "$generalInformation.tenderReferenceNo",
          department: {
            $cond: [
              { $isArray: "$generalInformation.organizationHierarchy" },
              [{ $arrayElemAt: ["$generalInformation.organizationHierarchy", 1] }],
              [],
            ],
          },
          slug: 1,
          endDate: "$dateSchedule.bidSubmissionDueDate",
          status: 1,
        },
      },
    ]).exec(),
  ]);

  const currentPage =
    skip !== undefined ? Math.floor(numericSkip / numericLimit) + 1 : Math.max(1, parseInt(page, 10) || 1);

  return {
    success: true,
    data: items,
    meta: { total, limit: numericLimit, skip: numericSkip, page: currentPage },
  };
}

/* ---------------------------- UPDATE ---------------------------- */
export async function updateTenderController(id: string, body: any) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid id");
  }

  const forbidden = [
    "tenderId",
    "tenderIdSeq",
    "tenderIdShort",
    "tenderIdCluster",
    "slug",
  ];
  forbidden.forEach((f) => delete body[f]);

  const updated = await Tender.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true }
  ).lean();

  if (!updated) throw new AppError(404, "Tender not found");

  return {
    success: true,
    message: "Tender updated",
    data: updated,
  };
}

/* ---------------------------- SOFT DELETE ---------------------------- */
export async function softDeleteTenderController(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid id");
  }

  const updated = await Tender.findByIdAndUpdate(
    id,
    { $set: { isDeleted: true, isActive: false, status: "CLOSED" } },
    { new: true }
  ).lean();

  if (!updated) throw new AppError(404, "Tender not found");

  return {
    success: true,
    message: "Tender soft-deleted",
    data: updated,
  };
}

/* ---------------------------- CANCEL ---------------------------- */
export async function cancelTenderController(
  id: string,
  cancelReason?: string,
  cancelledByAdminId?: string
) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid id");
  }

  const update: any = {
    status: "CANCELLED",
    cancelReason: cancelReason ?? "Cancelled by admin",
    cancelTime: new Date(),
    isActive: false,
  };
  if (cancelledByAdminId) update.adminId = cancelledByAdminId;

  const updated = await Tender.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true }
  ).lean();

  if (!updated) throw new AppError(404, "Tender not found");

  return {
    success: true,
    message: "Tender cancelled",
    data: updated,
  };
}

export async function archiveTendersController() {
  const now = Date.now();

  const result = await Tender.updateMany(
    {
      status: "PUBLISHED",
      "dateSchedule.bidSubmissionDueDate.raw": { $lt: now },
    },
    {
      $set: { status: "ARCHIVED" },
    }
  );

  return {
    success: true,
    data: {
      matched: result.matchedCount,
      archived: result.modifiedCount,
    },
  };
}