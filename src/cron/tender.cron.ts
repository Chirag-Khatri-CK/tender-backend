import cron from "node-cron";
import { syncTenders } from "../services/tenderSync.service";
import { archiveTendersController } from "../controllers/tender.controller";

let isSyncRunning = false;
let isArchiveRunning = false;

export function startTenderCron() {
    console.log("Cron Triggered At:", new Date().toISOString());
    console.log("Tender Crons Registered");

    // Sync tenders every 4 hours
    cron.schedule("0 */4 * * *", async () => {
        if (isSyncRunning) {
            console.log("Previous sync still running. Skipping...");
            return;
        }

        try {
            isSyncRunning = true;
            console.log("Running Tender Sync...");
            await syncTenders();
            console.log("Tender Sync Completed");
        } catch (err: any) {
            console.error("Tender Sync Error:", err.message);
        } finally {
            isSyncRunning = false;
        }
    });

    // Archive expired tenders every 5 minutes
    cron.schedule("*/5 * * * *", async () => {
        if (isArchiveRunning) {
            console.log("Previous archive still running. Skipping...");
            return;
        }

        try {
            isArchiveRunning = true;
            const result = await archiveTendersController();
            if (result.data.archived > 0) {
                console.log(`Archived ${result.data.archived} expired tenders`);
            }
        } catch (err: any) {
            console.error("Tender Archive Error:", err.message);
        } finally {
            isArchiveRunning = false;
        }
    });
}