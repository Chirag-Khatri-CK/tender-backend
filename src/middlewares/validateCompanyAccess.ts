// middleware/validateCompanyAccess.ts
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import Company from "../models/company/Company";
import { AppError } from "../utils/AppError";

export const validateCompanyAccess = async (
    req: Request & { user?: any; company?: any },
    res: Response,
    next: NextFunction
) => {
    try {
        const companyId = String(req.params.companyId || req.params.id);
        const userId = req.user.userId;
        const role = req.user?.role;

        if (!Types.ObjectId.isValid(companyId)) throw new AppError(400, "Invalid Company ID");

        const company = await Company.findOne({ _id: companyId, isDeleted: false, });

        if (!company) throw new AppError(404, "Company not found");

        if (role !== "admin" && company.createdBy.toString() !== userId?.toString()) throw new AppError(403, "Unauthorized");

        req.company = company;
        next();

    } catch (err: any) {
        const status = err instanceof AppError ? err.status : 400;
        return res.status(status).json({ message: err.message });
    }
};