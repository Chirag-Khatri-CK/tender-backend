
import { listContractorsController } from "./contractor.controller";
import { listTendersController } from "./tender.controller";


export async function dashboardAnalytics(query: any) {
    const { limit = 5 } = query;
    const [latestUsers, premiumUsers, latestTenders] = await Promise.all([
        listContractorsController({ limit }),
        listContractorsController({ limit, isPremium: "true" }),
        listTendersController({ limit })
    ]);

    return {
        data: {
            latestUsers: latestUsers?.data,
            latestTenders: latestTenders?.data,
            totalUserCount: latestUsers?.meta?.total,
            totalTenderCount: latestTenders?.meta?.total,
            premiumUsers: premiumUsers?.meta?.total,
        },
        success: true,
        message: "Dashboard insights retrieved successfully."
    };
}

