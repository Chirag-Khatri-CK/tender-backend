"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContractor = createContractor;
exports.updateContractor = updateContractor;
exports.getContractor = getContractor;
const Contractor_1 = __importDefault(require("../models/Contractor"));
const mongoose_1 = require("mongoose");
const user_controller_1 = require("./user.controller");
async function createContractor(req, res) {
    try {
        const payload = req.body;
        const doc = await Contractor_1.default.create(payload);
        return res.json({ ok: true, contractor: doc });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
}
async function updateContractor(req, res) {
    try {
        const contractorId = req.params.id;
        const body = req.body || {};
        if (!contractorId) {
            return res.status(400).json({
                success: false, status: 400, message: "Contractor ID required"
            });
        }
        if (!mongoose_1.Types.ObjectId.isValid(contractorId)) {
            return res.status(400).json({ success: false, status: 400, message: "Invalid Contractor ID" });
        }
        const contractor = await Contractor_1.default.findById(contractorId).exec();
        if (!contractor) {
            return res.status(404).json({ success: false, status: 404, message: "Contractor not found" });
        }
        const { restBody } = await (0, user_controller_1.updateUserAndSplit)({ userId: contractor.userId.toString(), body });
        if (Object.keys(restBody).length > 0) {
            Object.assign(contractor, restBody);
            await contractor.save();
        }
        return getContractor(req, res);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Server error",
        });
    }
}
async function getContractor(req, res) {
    try {
        const id = new mongoose_1.Types.ObjectId(req.params.id);
        let doc = await Contractor_1.default.aggregate([
            {
                $match: {
                    isDeleted: false,
                    _id: id
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ["$user", "$$ROOT"]
                    }
                }
            },
            {
                $project: {
                    user: 0,
                    password: 0,
                    __v: 0
                }
            }
        ]);
        doc = doc?.[0];
        if (!doc?._id)
            return res.status(404).json({ message: 'not found' });
        return res.json({ contractor: doc });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
}
