import mongoose from "mongoose";
import config from "../config";
import { runTenderSyncJob } from "../cron";

(async () => {
    try {
        console.log("Sync Cron Started");

        await mongoose.connect(config.db.uri);

        await runTenderSyncJob();

        console.log("Sync Done");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();