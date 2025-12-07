import { Request, Response } from 'express';
import { updateUserAndSplit } from "./user.controller";
import Admin from '../models/Admin';
import { Types } from 'mongoose';

export async function createAdmin(req: Request, res: Response) {
  try {
    const { userId, permissions } = req.body;
    const doc = await Admin.create({ userId, permissions });
    return res.json({ ok: true, admin: doc });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
}

export async function updateAdmin(req: Request, res: Response) {
  try {
    const adminId = req.params.id;
    const body = req.body || {};

    if (!adminId) {
      return res.status(400).json({ success: false, status: 400, message: "Admin ID required" });
    }

    if (!Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ success: false, status: 400, message: "Invalid Admin ID" });
    }

    const admin = await Admin.findById(adminId).exec();
    if (!admin) {
      return res.status(404).json({ success: false, status: 404, message: "Admin not found" });
    }

    const { restBody } = await updateUserAndSplit({ userId: admin.userId.toString(), body });
    if (Object.keys(restBody).length > 0) {
      Object.assign(admin, restBody); 
      await admin.save();
    }

    return getAdmin(req, res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Server error",
    });
  }
}

export async function getAdmin(req: Request, res: Response) {
  try {
    const id = new Types.ObjectId(req.params.id);
    let doc: any = await Admin.aggregate([
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
    ])

    console.log("dasdsd", doc);

    doc = doc?.[0];

    if (!doc?._id) return res.status(404).json({ message: 'not found' });
    return res.json({ admin: doc });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
}
