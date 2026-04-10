import mongoose from "mongoose";
import config from "../config";
import { runTenderArchiveJob } from "../cron";

(async () => {
    try {
        console.log("Archive Cron Started");

        await mongoose.connect(config.db.uri);

        await runTenderArchiveJob();

        console.log("Archive Done");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();