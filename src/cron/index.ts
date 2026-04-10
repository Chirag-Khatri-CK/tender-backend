import { runTenderSyncJob, runTenderArchiveJob } from "./tender.job";

export async function startAllCrons() {
    console.log("Executing All Cron Jobs...");

    await runTenderSyncJob();
    await runTenderArchiveJob();
}