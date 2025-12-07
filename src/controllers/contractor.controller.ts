import { Request, Response } from 'express';
import Contractor from '../models/Contractor';
import { Types } from 'mongoose';
import { updateUserAndSplit } from './user.controller';

export async function createContractor(req: Request, res: Response) {
  try {
    const payload = req.body;
    const doc = await Contractor.create(payload);
    return res.json({ ok: true, contractor: doc });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
}

export async function updateContractor(req: Request, res: Response) {
  try {
    const contractorId = req.params.id;
    const body = req.body || {};

    if (!contractorId) {
      return res.status(400).json({
        success: false, status: 400, message: "Contractor ID required"
      });
    }

    if (!Types.ObjectId.isValid(contractorId)) {
      return res.status(400).json({ success: false, status: 400, message: "Invalid Contractor ID" });
    }

    const contractor = await Contractor.findById(contractorId).exec();
    if (!contractor) {
      return res.status(404).json({ success: false, status: 404, message: "Contractor not found" });
    }

    const { restBody } = await updateUserAndSplit({ userId: contractor.userId.toString(), body });
    if (Object.keys(restBody).length > 0) {
      Object.assign(contractor, restBody);
      await contractor.save();
    }

    return getContractor(req, res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Server error",
    });
  }
}


export async function getContractor(req: Request, res: Response) {
  try {
    const id = new Types.ObjectId(req.params.id);
    let doc: any = await Contractor.aggregate([
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

    if (!doc?._id) return res.status(404).json({ message: 'not found' });
    return res.json({ contractor: doc });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
}

