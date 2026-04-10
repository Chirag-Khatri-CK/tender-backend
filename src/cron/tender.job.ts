import { syncTenders } from "../services/tenderSync.service";
import { archiveTendersController } from "../controllers/tender.controller";

export async function runTenderSyncJob() {
    console.log("Running Tender Sync...");
    await syncTenders();
    console.log("Tender Sync Completed");
}

export async function runTenderArchiveJob() {
    console.log("Running Tender Archive...");
    const result = await archiveTendersController();

    if (result?.data?.archived > 0) {
        console.log(`Archived ${result.data.archived} expired tenders`);
    }
}