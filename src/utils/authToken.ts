// src/utils/authToken.ts
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import config from "../config";
import User from "../models/core/User";


export async function generateAuthToken(user: any) {
    const payload = {
        userId: user._id,
        role: user.role
    };

    const accessToken = jwt.sign(
        payload,
        config.jwt.secret as Secret,
        { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    return {
        accessToken,
        role: user.role,
        userId: user._id
    };
}

export async function getUserWithRole(id: string, role: string) {
    const query: any = {
        _id: id,
        isDeleted: false,
        isActive: true
    };

    if (role) query.role = role;

    const user = await User.findOne(query).select("-password -__v").lean();
    if (!user) throw new Error("User not found");

    return user;
}