// src/utils/authToken.ts
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import config from "../config";
import Admin from "../models/Admin";
import Contractor from "../models/Contractor";
import Engineer from "../models/Engineer";

export async function getRoleDoc(user: any) {
    const userId = user._id;

    switch (user.role) {
        case "admin":
            return Admin.findOne({ userId }).select("-createdAt -updatedAt -__v").lean();

        case "contractor":
            return Contractor.findOne({ userId }).select("-createdAt -updatedAt -__v").lean();

        case "engineer":
            return Engineer.findOne({ userId }).select("-createdAt -updatedAt -__v").lean();

        default:
            throw new Error(`Unknown role: ${user.role}`);
    }
}

export async function generateAuthToken(user: any) {
    const roleDoc: any = await getRoleDoc(user);
    if (!roleDoc) throw new Error(`Role document for ${user.role} not found`);

    const payload = {
        sub: roleDoc._id.toString(),
        uid: user._id.toString(),
        role: user.role,
    };

    const token = jwt.sign(
        payload,
        config.jwt.secret as Secret,
        { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    return { token, roleDoc, payload };
}
