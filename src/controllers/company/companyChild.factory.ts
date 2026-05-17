import { Types, Model } from "mongoose";
import { AppError } from "../../utils/AppError";

export function createCompanyChildCrud(ModelRef: Model<any>, entityName: string) {

  const sanitize = (body: any) => {
    const clean = { ...body };

    delete clean._id;
    delete clean.companyId;
    delete clean.isDeleted;
    delete clean.createdAt;
    delete clean.updatedAt;
    delete clean.__v;

    return clean;
  };

  return {
    create: async (companyId: string, body: any) => {
      if (!Types.ObjectId.isValid(companyId))
        throw new AppError(400, "Invalid Company ID");

      let docs;

      if (Array.isArray(body)) {
        docs = await ModelRef.insertMany(
          body.map(item => ({
            ...sanitize(item),
            companyId
          }))
        );
      } else {
        docs = await ModelRef.create({
          ...sanitize(body),
          companyId
        });
      }

      return {
        success: true,
        message: `${entityName} created successfully`,
        data: docs
      };
    },

    get: async (id: string) => {
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError(400, "Invalid ID");
      }

      const doc = await ModelRef.findOne({ _id: id, isDeleted: false });
      if (!doc) {
        throw new AppError(404, "Not found");
      }

      return {
        success: true,
        message: `${entityName} fetched successfully`,
        data: doc
      };
    },

    update: async (id: string, body: any) => {
      if (!Types.ObjectId.isValid(id))
        throw new AppError(400, "Invalid ID");

      const doc = await ModelRef.findByIdAndUpdate(
        id,
        { $set: sanitize(body) },
        { new: true }
      );

      if (!doc) throw new AppError(404, "Not found");

      return {
        success: true,
        message: `${entityName} updated successfully`,
        data: doc
      };
    },

    remove: async (id: string) => {
      const doc = await ModelRef.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { returnDocument: 'after' }
      );

      if (!doc) throw new AppError(404, "Not found");

      return {
        success: true, message: `${entityName} deleted successfully`
      };
    },

    list: async (companyId: string, query: any) => {
      if (!Types.ObjectId.isValid(companyId))
        throw new AppError(400, "Invalid Company ID");

      const {
        sort = "createdAt",
        limit = "10",
        skip,
        page = "1",
        q,
        isActive,
      } = query as Record<string, string>;

      const match: any = {
        companyId: new Types.ObjectId(companyId),
        isDeleted: false,
      };

      // Optional filter
      if (isActive !== undefined) {
        match.isActive = isActive === "true";
      }

      // Search
      if (q) {
        const re = new RegExp(q.trim(), "i");

        const searchableFields = [
          "name",
          "email",
          "phone",
          "designation",
          "pan",
          "gstin",
          "din",
          "cin",
          "aadhaar",
          "licenseNumber",
          "registrationNumber",
        ];

        match.$or = searchableFields.map((field) => ({
          [field]: re,
        }));
      }

      // Sorting
      let sortDirection = -1;
      const dir = String(sort).toLowerCase();
      if (dir === "asc") sortDirection = 1;
      if (dir === "desc") sortDirection = -1;

      const sortObj = { createdAt: sortDirection };

      // Pagination
      const numericLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));
      let numericSkip = 0;

      if (skip !== undefined) {
        numericSkip = Math.max(0, parseInt(skip) || 0);
      } else {
        const numericPage = Math.max(1, parseInt(page) || 1);
        numericSkip = (numericPage - 1) * numericLimit;
      }

      const pipeline: any[] = [
        { $match: match },
        { $sort: sortObj },
        {
          $project: {
            updatedAt: 0,
            isDeleted: 0,
          },
        },
        {
          $facet: {
            items: [
              { $skip: numericSkip },
              { $limit: numericLimit },
            ],
            total: [
              { $count: "count" },
            ],
          },
        },
      ];

      const aggResult = await ModelRef.aggregate(pipeline).exec();
      const facet = aggResult[0] || { items: [], total: [] };

      const items = facet.items || [];
      const total =
        facet.total?.[0]?.count || 0;

      const currentPage =
        skip !== undefined
          ? Math.floor(numericSkip / numericLimit) + 1
          : Math.max(1, parseInt(page) || 1);

      return {
        success: true,
        data: items,
        message: `${entityName} list fetched successfully`,
        meta: {
          total,
          limit: numericLimit,
          skip: numericSkip,
          page: currentPage,
          totalPages: Math.ceil(total / numericLimit),
        },
      };
    }
  };
}
