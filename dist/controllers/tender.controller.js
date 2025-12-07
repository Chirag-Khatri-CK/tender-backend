"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTender = createTender;
exports.getTender = getTender;
exports.listTenders = listTenders;
exports.updateTender = updateTender;
exports.softDeleteTender = softDeleteTender;
exports.cancelTender = cancelTender;
const mongoose_1 = __importDefault(require("mongoose"));
const Tender_1 = __importDefault(require("../models/Tender"));
const commonUtil_1 = require("../utils/commonUtil");
async function generateTenderIds(title) {
    const seq = await (0, commonUtil_1.getNextDailySequence)("tender"); // << universal
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = (0, commonUtil_1.pad)(now.getMonth() + 1);
    const DD = (0, commonUtil_1.pad)(now.getDate());
    const tenderId = `TED-${YYYY}${MM}${DD}-${(0, commonUtil_1.pad)(seq, 4)}`;
    const slug = await (0, commonUtil_1.generateUniqueSlug)(title, Tender_1.default, tenderId);
    return { tenderId, slug };
}
async function createTender(req, res) {
    try {
        const body = req.body;
        const title = body?.generalInformation?.tenderTitle ||
            body?.generalInformation?.detailedDescription || "untitled-tender";
        const { tenderId, slug } = await generateTenderIds(title);
        body.tenderId = body.tenderId ?? tenderId;
        body.slug = slug;
        body.isDeleted = body.isDeleted ?? false;
        body.isActive = body.isActive ?? true;
        body.status = body.status ?? "ACTIVE";
        body.meta = body.meta ?? {};
        body.meta.createdBy = body.meta.createdBy ?? "SYSTEM";
        body.meta.createdOn = body.meta.createdOn ?? { raw: String(Date.now()), formatted: new Date().toISOString() };
        const tender = await Tender_1.default.create(body);
        return res.status(201).json({
            success: true,
            message: "Tender created successfully",
            data: {
                tenderId: tender.tenderId,
                slug: tender.slug,
                _id: tender._id
            }
        });
    }
    catch (err) {
        console.error("createTendermessage :", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to create tender" });
    }
}
async function getTender(req, res) {
    try {
        const { slug, tenderId, systemTenderNo } = req.query;
        const idParam = req.params.id;
        let query = null;
        if (slug && typeof slug === "string") {
            query = { slug: slug.toLowerCase() };
        }
        else if (tenderId && typeof tenderId === "string") {
            query = { tenderId: tenderId };
        }
        else if (systemTenderNo && typeof systemTenderNo === "string") {
            query = { "generalInformation.systemTenderNo": systemTenderNo };
        }
        else if (idParam && mongoose_1.default.Types.ObjectId.isValid(idParam)) {
            query = { _id: idParam };
        }
        else {
            return res.status(400).json({ success: false, message: "Provide ?slug or ?tenderId or ?systemTenderNo or /:id" });
        }
        const tender = await Tender_1.default.findOne(query).lean();
        if (!tender)
            return res.status(404).json({ success: false, message: "Tender not found" });
        return res.json({ success: true, data: tender });
    }
    catch (err) {
        console.error("getTendermessage :", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to fetch tender" });
    }
}
async function listTenders(req, res) {
    try {
        const { page = "1", limit = "20", skip, sort = "-createdAt", procurementCategory, status, q } = req.query;
        const match = { isDeleted: false };
        if (procurementCategory)
            match["generalInformation.procurementCategory"] = procurementCategory;
        if (status)
            match["status"] = status;
        if (q) {
            const re = new RegExp(String(q).trim(), "i");
            match.$or = [
                { "generalInformation.tenderTitle": re },
                { "generalInformation.tenderReferenceNo": re },
                { "tenderId": re },
                { "slug": re }
            ];
        }
        const sortObj = {};
        String(sort)
            .split(",")
            .forEach(s => {
            const [k, dir] = s.split(":").map(x => x.trim());
            if (!k)
                return;
            sortObj[k] = dir === "asc" || dir === "1" ? 1 : -1;
        });
        const numericLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
        let numericSkip = 0;
        if (skip !== undefined) {
            numericSkip = Math.max(0, parseInt(skip, 10) || 0);
        }
        else {
            const pageNum = Math.max(1, parseInt(page, 10) || 1);
            numericSkip = (pageNum - 1) * numericLimit;
        }
        const pipeline = [];
        pipeline.push({ $match: match });
        pipeline.push({ $sort: sortObj });
        pipeline.push({
            $project: {
                tenderId: 1,
                slug: 1,
                status: 1,
                isActive: 1,
                "generalInformation.tenderTitle": 1,
                "generalInformation.tenderReferenceNo": 1,
                "generalInformation.procurementCategory": 1,
                createdAt: 1,
                updatedAt: 1
            }
        });
        pipeline.push({
            $facet: {
                data: [
                    { $skip: numericSkip },
                    { $limit: numericLimit }
                ],
                meta: [
                    { $count: "total" }
                ]
            }
        });
        pipeline.push({
            $project: {
                data: 1,
                total: { $arrayElemAt: ["$meta.total", 0] }
            }
        });
        const aggRes = await Tender_1.default.aggregate(pipeline).allowDiskUse(true).exec();
        const result = aggRes[0] ?? { data: [], total: 0 };
        const items = result.data ?? [];
        const total = result.total ?? 0;
        return res.json({
            success: true,
            data: items,
            meta: {
                total,
                limit: numericLimit,
                skip: numericSkip,
                page: skip !== undefined ? Math.floor(numericSkip / numericLimit) + 1 : Math.max(1, parseInt(page, 10) || 1)
            }
        });
    }
    catch (err) {
        console.error("listTendersAggregatedmessage :", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to list tenders" });
    }
}
async function updateTender(req, res) {
    try {
        const id = req.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(400).json({ success: false, message: "Invalid id" });
        const forbidden = ["tenderId", "tenderIdSeq", "tenderIdShort", "tenderIdCluster", "slug"];
        forbidden.forEach((f) => delete req.body[f]);
        const updated = await Tender_1.default.findByIdAndUpdate(id, { $set: req.body }, { new: true }).lean();
        if (!updated)
            return res.status(404).json({ success: false, message: "Tender not found" });
        return res.json({ success: true, message: "Tender updated", data: updated });
    }
    catch (err) {
        console.error("updateTendermessage :", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to update tender" });
    }
}
async function softDeleteTender(req, res) {
    try {
        const id = req.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(400).json({ success: false, message: "Invalid id" });
        const updated = await Tender_1.default.findByIdAndUpdate(id, { $set: { isDeleted: true, isActive: false, status: "CLOSED" } }, { new: true }).lean();
        if (!updated)
            return res.status(404).json({ success: false, message: "Tender not found" });
        return res.json({ success: true, message: "Tender soft-deleted", data: updated });
    }
    catch (err) {
        console.error("softDeleteTendermessage :", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to delete tender" });
    }
}
async function cancelTender(req, res) {
    try {
        const id = req.params.id;
        const { cancelReason, cancelledByAdminId } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(400).json({ success: false, message: "Invalid id" });
        const update = {
            status: "CANCELLED",
            cancelReason: cancelReason ?? "Cancelled by admin",
            cancelTime: new Date(),
            isActive: false
        };
        if (cancelledByAdminId)
            update.adminId = cancelledByAdminId;
        const updated = await Tender_1.default.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
        if (!updated)
            return res.status(404).json({ success: false, message: "Tender not found" });
        return res.json({ success: true, message: "Tender cancelled", data: updated });
    }
    catch (err) {
        console.error("cancelTendermessage :", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to cancel tender" });
    }
}
