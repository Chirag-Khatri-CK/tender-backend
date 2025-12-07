"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_UPDATABLE_FIELDS = void 0;
exports.updateUserAndSplit = updateUserAndSplit;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const { Types } = mongoose_1.default;
exports.USER_UPDATABLE_FIELDS = [
    "email",
    "phone",
    "password",
    "role",
    "status",
    "emailVerified",
    "phoneVerified",
    "name",
    "isActive",
];
async function updateUserAndSplit({ userId, body }) {
    if (!Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user id");
    }
    const incoming = { ...body };
    const fieldsToDelete = ["_id", "isDeleted"];
    fieldsToDelete.forEach((f) => delete incoming[f]);
    const userBody = {};
    const restBody = {};
    Object.entries(incoming).forEach(([key, value]) => {
        if (exports.USER_UPDATABLE_FIELDS.includes(key)) {
            userBody[key] = value;
        }
        else {
            restBody[key] = value;
        }
    });
    let updatedUser = null;
    if (Object.keys(userBody).length > 0) {
        updatedUser = await User_1.default.findOneAndUpdate({ _id: userId, isDeleted: false }, userBody, { new: true }).select("-password -__v");
    }
    return { updatedUser, userBody, restBody };
}
