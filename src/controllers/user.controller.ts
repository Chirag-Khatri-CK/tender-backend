import mongoose from "mongoose";
import User from "../models/User";

const { Types } = mongoose;

export const USER_UPDATABLE_FIELDS = [
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

type UpdateUserAndSplitArgs = {
    userId: string;
    body: Record<string, any>;
};

export async function updateUserAndSplit({ userId, body }: UpdateUserAndSplitArgs) {
    if (!Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user id");
    }

    const incoming = { ...body };
    const fieldsToDelete = ["_id", "isDeleted"];
    fieldsToDelete.forEach((f) => delete incoming[f]);

    const userBody: Record<string, any> = {};
    const restBody: Record<string, any> = {};

    Object.entries(incoming).forEach(([key, value]) => {
        if (USER_UPDATABLE_FIELDS.includes(key)) {
            userBody[key] = value;
        } else {
            restBody[key] = value;
        }
    });

    let updatedUser = null;

    if (Object.keys(userBody).length > 0) {
        updatedUser = await User.findOneAndUpdate(
            { _id: userId, isDeleted: false },
            userBody,
            { new: true }
        ).select("-password -__v");
    }

    return { updatedUser, userBody, restBody };
}
