"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdmin = createAdmin;
exports.updateAdmin = updateAdmin;
exports.getAdmin = getAdmin;
const user_controller_1 = require("./user.controller");
const Admin_1 = __importDefault(require("../models/Admin"));
const mongoose_1 = require("mongoose");
async function createAdmin(req, res) {
    try {
        const { userId, permissions } = req.body;
        const doc = await Admin_1.default.create({ userId, permissions });
        return res.json({ ok: true, admin: doc });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
}
async function updateAdmin(req, res) {
    try {
        const adminId = req.params.id;
        const body = req.body || {};
        if (!adminId) {
            return res.status(400).json({ success: false, status: 400, message: "Admin ID required" });
        }
        if (!mongoose_1.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({ success: false, status: 400, message: "Invalid Admin ID" });
        }
        const admin = await Admin_1.default.findById(adminId).exec();
        if (!admin) {
            return res.status(404).json({ success: false, status: 404, message: "Admin not found" });
        }
        const { restBody } = await (0, user_controller_1.updateUserAndSplit)({ userId: admin.userId.toString(), body });
        if (Object.keys(restBody).length > 0) {
            Object.assign(admin, restBody);
            await admin.save();
        }
        return getAdmin(req, res);
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
async function getAdmin(req, res) {
    try {
        const id = new mongoose_1.Types.ObjectId(req.params.id);
        let doc = await Admin_1.default.aggregate([
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
        console.log("dasdsd", doc);
        doc = doc?.[0];
        if (!doc?._id)
            return res.status(404).json({ message: 'not found' });
        return res.json({ admin: doc });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
}
