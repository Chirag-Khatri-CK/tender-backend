import mongoose from "mongoose";
import config from "./config";
import { startAllCrons } from "./cron";

(async () => {
    try {
        console.log("Starting cron runner...");

        await mongoose.connect(config.db.uri);
        console.log("DB connected");

        await startAllCrons();

        console.log("All cron jobs completed");
        process.exit(0);
    } catch (err) {
        console.error("Cron failed", err);
        process.exit(1);
    }
})();