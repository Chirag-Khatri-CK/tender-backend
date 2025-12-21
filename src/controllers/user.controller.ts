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
    "isPremiumMember"
];

type UpdateUserAndSplitArgs = {
    userId: string;
    body: Record<string, any>;
};



function addDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function calculatePremiumExpiry(plan: string, from = new Date()) {
    switch (plan) {
        case "MONTHLY":
            return addDays(from, 30);
        case "YEARLY":
            return addDays(from, 365);
        case "LIFETIME":
            return addDays(from, 365 * 5);
        case "FREE":
        default:
            return null;
    }
}


export async function updateUserAndSplit({ userId, body }: UpdateUserAndSplitArgs) {
    if (!Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user id");
    }

    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
        throw new Error("User not found");
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

    if ("isPremiumMember" in userBody || "premiumPlan" in userBody) {

        const wasPremium = Boolean(user.isPremiumMember);
        const willBePremium = Boolean(userBody.isPremiumMember);
        const newPlan = userBody.premiumPlan ?? user.premiumPlan;

        const now = new Date();

        // FREE → PREMIUM
        if (!wasPremium && willBePremium) {
            userBody.subscribeAt = now;
            userBody.premiumPlan = newPlan;
            userBody.premiumExpiresAt = calculatePremiumExpiry(newPlan, now);
        }

        // PREMIUM → FREE
        if (wasPremium && !willBePremium) {
            userBody.premiumPlan = "FREE";
            userBody.premiumExpiresAt = null;
            userBody.subscribeAt = null;
        }

        // PREMIUM → PREMIUM (plan change)
        if (wasPremium && willBePremium && newPlan !== user.premiumPlan) {
            userBody.premiumPlan = newPlan;
            userBody.premiumExpiresAt = calculatePremiumExpiry(newPlan, now);
        }
    }


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
