// src/utils/authToken.ts
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import config from "../config";
import { Types, Model } from "mongoose";
import Admin from "../models/Admin";
import Contractor from "../models/Contractor";
import Engineer from "../models/Engineer";

const ROLE_MODELS: Record<string, any> = {
  admin: Admin,
  contractor: Contractor,
  engineer: Engineer,
};

export async function getRoleDoc(user: any) {
    const Model = ROLE_MODELS[user.role];
    if (!Model) throw new Error(`Unknown role: ${user.role}`);

    return Model.findOne({ userId: user._id, isDeleted: false })
        .select("_id")
        .lean();
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

    return { accessToken: token, roleId: roleDoc._id.toString(), userId: user._id.toString() };
}

export async function getUserWithRole(Model: Model<any>, id: string) {
    if (!Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ID`);
    }

    const result = await Model.aggregate([
        {
            $match: {
                _id: new Types.ObjectId(id),
                isDeleted: false,
                isActive: true
            }
        },
        { $limit: 1 },
        {
            $lookup: {
                from: "users",
                let: { uid: "$userId" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$uid"] },
                            isDeleted: false
                        }
                    },
                    { $unset: ["password", "__v"] }
                ],
                as: "user"
            }
        },
        { $unwind: "$user" },
        {
            $replaceRoot: {
                newRoot: {
                    user: {
                        $mergeObjects: [
                            "$user",
                            {
                                _id: "$_id",
                                userId: "$userId",
                                permissions: "$permissions",
                                roleId: "$_id"
                            }
                        ]
                    }
                }
            }
        }
    ]);

    if (!result.length) {
        throw new Error(`${Model} not found`);
    }

    return result[0];
};

/* ---------------------------- Ensure Role Doc ---------------------------- */
export async function ensureRoleDoc(user: any) {
    const Model = ROLE_MODELS[user.role];
    if (!Model) throw new Error(`Unknown role: ${user.role}`);

    const exists = await Model.findOne({ userId: user._id });
    if (exists) return;

    await Model.create({ userId: user._id });
}

