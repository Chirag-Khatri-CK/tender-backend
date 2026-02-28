import { startTenderCron } from "./tender.cron";

export function startAllCrons() {
    console.log("Initializing All Crons...");
    startTenderCron();
}