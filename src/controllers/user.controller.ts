import mongoose from "mongoose";
import User from "../models/core/User";

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

