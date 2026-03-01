
import { Types, Model } from "mongoose";
import { AppError } from "../../utils/AppError";

export function createCompanyChildCrud(ModelRef: Model<any>) {
  return {
    create: async (companyId: string, body: any) => {
      if (!Types.ObjectId.isValid(companyId))
        throw new AppError(400, "Invalid Company ID");

      let docs;

      if (Array.isArray(body)) {
        docs = await ModelRef.insertMany(
          body.map(item => ({
            ...item,
            companyId
          }))
        );
      } else {
        docs = await ModelRef.create({
          ...body,
          companyId
        });
      }

      return {
        success: true,
        message: "Created successfully",
        data: docs
      };
    },

    update: async (id: string, body: any) => {
      if (!Types.ObjectId.isValid(id))
        throw new AppError(400, "Invalid ID");

      const doc = await ModelRef.findByIdAndUpdate(id, body, { new: true });
      if (!doc) throw new AppError(404, "Not found");

      return { success: true, message: "Updated", data: doc };
    },

    remove: async (id: string) => {
      const doc = await ModelRef.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );

      if (!doc) throw new AppError(404, "Not found");

      return { success: true, message: "Deleted" };
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
        match.$or = [
          { name: re },
          { designation: re },
          { pan: re },
          { din: re },
        ];
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
        Array.isArray(facet.total) &&
          facet.total[0] &&
          facet.total[0].count
          ? facet.total[0].count
          : 0;

      const currentPage =
        skip !== undefined
          ? Math.floor(numericSkip / numericLimit) + 1
          : Math.max(1, parseInt(page) || 1);

      return {
        success: true,
        data: items,
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
