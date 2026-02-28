import cron from "node-cron";
import { syncTenders } from "../services/tenderSync.service";

let isRunning = false;

export function startTenderCron() {
    console.log("Cron Triggered At:", new Date().toISOString());
    console.log("Tender Cron Registered (Every 4 Hours)");

    cron.schedule("0 */4 * * *", async () => {
    // cron.schedule("*/1 * * * *", async () => { 

        if (isRunning) {
            console.log("⏳ Previous sync still running. Skipping...");
            return;
        }

        try {
            isRunning = true;
            console.log("Running Tender Sync...");
            await syncTenders();
            console.log("Tender Sync Completed");
        } catch (err: any) {
            console.error("Tender Cron Error:", err.message);
        } finally {
            isRunning = false;
        }
    });
}