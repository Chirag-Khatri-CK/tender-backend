import cors, { CorsOptions } from "cors";
import config from "../config";

const corsOptions: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        const allowed = config.cors.allowedOrigins;

        if (!origin) return callback(null, true);

        if (allowed.includes("*")) return callback(null, true);

        if (allowed.includes(origin)) return callback(null, true);

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },

    credentials: config.cors.allowCredentials,

    exposedHeaders: ["x-correlation-id"],

    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-correlation-id",
        "ngrok-skip-browser-warning"
    ],

    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
