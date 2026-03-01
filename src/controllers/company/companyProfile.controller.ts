import { PipelineStage, Types } from "mongoose";
import Company from "../../models/company/Company";
import Director from "../../models/company/Director";
import Engineer from "../../models/company/Engineer";
import Equipment from "../../models/company/Equipment";
import Registration from "../../models/company/Registration";
import Bid from "../../models/company/Bid";
import Audit from "../../models/company/Audit";
import ExperienceCertificate from "../../models/company/ExperienceCertificate";
import ExperienceQuantity from "../../models/company/ExperienceQuantity";
import ExistingCommitment from "../../models/company/ExistingCommitment";
import { AppError } from "../../utils/AppError";


async function validateCompanyAccess(
    companyId: string,
    userId: string,
    role: string
) {
    if (!Types.ObjectId.isValid(companyId))
        throw new AppError(400, "Invalid Company ID");

    const company = await Company.findOne({
        _id: companyId,
        isDeleted: false,
    });

    if (!company) throw new AppError(404, "Company not found");

    if (   // role !== "admin" &&
        company.createdBy.toString() !== userId
    ) {
        throw new AppError(403, "Unauthorized");
    }

    return company;
}

async function calculateProfileCompletion(companyId: string) {
    const company: any = await Company.findOne({ _id: companyId, isDeleted: false }).lean();
    if (!company) return 0;

    const sections = await Promise.all([
        Promise.resolve(!!company.name && !!company.email),

        Director.countDocuments({ companyId, isDeleted: false }).then(c => c > 0),
        Engineer.countDocuments({ companyId, isDeleted: false }).then(c => c > 0),
        Equipment.countDocuments({ companyId, isDeleted: false }).then(c => c > 0),
        Registration.countDocuments({ companyId, isDeleted: false }).then(c => c > 0),
        Bid.countDocuments({ companyId, isDeleted: false }).then(c => c > 0),
        Audit.countDocuments({ companyId, isDeleted: false }).then(c => c > 0),
        ExperienceCertificate.countDocuments({ companyId, isDeleted: false }).then(c => c > 0),
        ExperienceQuantity.countDocuments({ companyId, isDeleted: false }).then(c => c > 0),
        ExistingCommitment.countDocuments({ companyId, isDeleted: false }).then(c => c > 0),
    ]);

    const totalSections = sections.length;
    const completedSections = sections.filter(Boolean).length;

    const percentage = Math.round((completedSections / totalSections) * 100);

    await Company.findByIdAndUpdate(companyId, {
        profileCompletion: percentage,
        profileStatus: percentage === 100 ? "completed" : "draft",
    });

    return percentage;
}

export async function createCompanyController(
    userId: string,
    body: Record<string, any>
) {
    if (!Types.ObjectId.isValid(userId))
        throw new AppError(400, "Invalid userId");

    const company = await Company.create({
        ...body,
        createdBy: userId,
    });

    return {
        success: true,
        message: "Company created successfully",
        data: company,
    };
}

export async function updateCompanyController(
    id: string,
    body: Record<string, any>,
    userId: string,
    role: string
) {
    const company = await validateCompanyAccess(id, userId, role);

    const incoming = { ...body };
    delete incoming._id;
    delete incoming.createdBy;
    delete incoming.profileCompletion;
    delete incoming.profileStatus;
    delete incoming.isDeleted;

    Object.assign(company, incoming);
    await company.save();

    const percentage = await calculateProfileCompletion(id);

    return {
        success: true,
        message: "Company updated successfully",
        data: company,
        profileCompletion: percentage,
    };
}

export async function getCompanyController(
    id: string,
    userId: string,
    role: string
) {

    await validateCompanyAccess(id, userId, role);

    const [
        company,
        directors,
        engineers,
        equipment,
        registrations,
        bids,
        audits,
        expCertificates,
        expQuantities,
        commitments,
        percentage
    ] = await Promise.all([
        Company.findById(id).lean(),
        Director.find({ companyId: id, isDeleted: false }).lean(),
        Engineer.find({ companyId: id, isDeleted: false }).lean(),
        Equipment.find({ companyId: id, isDeleted: false }).lean(),
        Registration.find({ companyId: id, isDeleted: false }).lean(),
        Bid.find({ companyId: id, isDeleted: false }).lean(),
        Audit.find({ companyId: id, isDeleted: false }).lean(),
        ExperienceCertificate.find({ companyId: id, isDeleted: false }).lean(),
        ExperienceQuantity.find({ companyId: id, isDeleted: false }).lean(),
        ExistingCommitment.find({ companyId: id, isDeleted: false }).lean(),
        calculateProfileCompletion(id)
    ]);

    return {
        success: true,
        message: "Company fetched successfully",
        data: {
            company,
            directors,
            engineers,
            equipment,
            registrations,
            bids,
            audits,
            expCertificates,
            expQuantities,
            commitments,
            profileCompletion: percentage,
        },
    };
}

export async function listCompaniesController(query: any) {
    const { q, limit = "20", page = "1", sort = "desc", } = query as Record<string, string>;

    const numericLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const numericPage = Math.max(1, Number(page) || 1);
    const numericSkip = (numericPage - 1) * numericLimit;
    const sortDir = sort === "asc" ? 1 : -1;

    const match: any = { isDeleted: false };

    if (q) {
        const re = new RegExp(q.trim(), "i");
        match.$or = [
            { name: re },
            { email: re },
        ];
    }

    const pipeline: PipelineStage[] = [
        { $match: match },

        { $sort: { createdAt: sortDir } },

        {
            $facet: {
                data: [
                    { $skip: numericSkip },
                    { $limit: numericLimit },
                    {
                        $project: {
                            __v: 0,
                            isDeleted: 0,
                        },
                    },
                ],
                totalCount: [
                    { $count: "count" },
                ],
            },
        },
    ];

    const result = await Company.aggregate(pipeline);

    const data = result[0]?.data || [];
    const total = result[0]?.totalCount?.[0]?.count || 0;

    return {
        success: true,
        message: "Companies fetched successfully",
        data,
        meta: {
            total,
            limit: numericLimit,
            page: numericPage,
            totalPages: Math.ceil(total / numericLimit),
        },
    };
}

export async function deleteCompanyController(id: string, role: string) {

    const company = await Company.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
    );

    if (!company) throw new AppError(404, "Company not found");

    await Promise.all([
        Director.updateMany({ company: id, isDeleted: false }, { isDeleted: true }),
        Engineer.updateMany({ company: id, isDeleted: false }, { isDeleted: true }),
        Equipment.updateMany({ company: id, isDeleted: false }, { isDeleted: true }),
        Registration.updateMany({ company: id, isDeleted: false }, { isDeleted: true }),
        Bid.updateMany({ company: id, isDeleted: false }, { isDeleted: true }),
        Audit.updateMany({ company: id, isDeleted: false }, { isDeleted: true }),
        ExperienceCertificate.updateMany({ company: id, isDeleted: false }, { isDeleted: true }),
        ExperienceQuantity.updateMany({ company: id, isDeleted: false }, { isDeleted: true }),
        ExistingCommitment.updateMany({ company: id, isDeleted: false }, { isDeleted: true }),
    ]);

    return {
        success: true,
        message: "Company deleted successfully",
    };
}