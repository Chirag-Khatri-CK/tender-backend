import path from "path";
import dotenv from "dotenv";

// Decide which env file to load: .env.dev / .env.qa / .env.prod
const APP_ENV = process.env.APP_ENV || "dev";

dotenv.config({
    path: path.join(process.cwd(), `.env.${APP_ENV}`),
});

type AppConfig = {
    env: string;
    port: number;
    db: { uri: string };
    jwt: { secret: string; expiresIn: string };
    session: { keyTtlSeconds: number };
    security: {
        encryptPayload: boolean;
        encryptBypass: string[];
    };
    ENCRYPT_PASS: string | undefined;
    logger: { enabled: boolean; level: string };
    otp: {
        ttlMinutes: number;
        resendIntervalSeconds: number;
        maxAttempts: number;
        digits: number;
    };
    rateLimit: {
        windowSeconds: number;
        maxRequests: number;
    };
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        auth: { user: string; pass: string };
        from: string;
    };
    sms: {
        provider: string;
        apiKey: string;
        from: string;
    };
    frontend: {
        baseUrl: string;
        encryptRouteParam: boolean;
    };
    correlationHeader: string;
    cors: {
        allowedOrigins: string[];
        allowCredentials: boolean;
    };
};

const config: AppConfig = {
    env: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT) || 5000,

    db: {
        uri: process.env.DB_URI || "mongodb://127.0.0.1:27017/tenderdb_dev",
    },

    jwt: {
        secret: process.env.JWT_SECRET || "change_me_in_env",
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },

    session: {
        keyTtlSeconds: Number(process.env.SESSION_TTL_SECONDS) || 86400,
    },

    security: {
        encryptPayload: process.env.ENCRYPT_PAYLOAD === "true",
        encryptBypass: ["/debug/decrypt", "/health", "/public/*"],
    },

    ENCRYPT_PASS: process.env.ENCRYPT_PASS,

    logger: {
        enabled: process.env.LOGGER_ENABLED === "true",
        level: process.env.LOGGER_LEVEL || "debug",
    },

    otp: {
        ttlMinutes: Number(process.env.OTP_TTL_MINUTES) || 5,
        resendIntervalSeconds: Number(process.env.OTP_RESEND_INTERVAL_SECONDS) || 60,
        maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS) || 5,
        digits: Number(process.env.OTP_DIGITS) || 6,
    },

    rateLimit: {
        windowSeconds: Number(process.env.RATE_LIMIT_WINDOW_SECONDS) || 60,
        maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
    },

    smtp: {
        host: process.env.SMTP_HOST || "smtp.mailtrap.io",
        port: Number(process.env.SMTP_PORT) || 2525,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER || "dev_smtp_user",
            pass: process.env.SMTP_PASS || "dev_smtp_pass",
        },
        from: process.env.SMTP_FROM || "no-reply@dev.tender.example.com",
    },

    sms: {
        provider: process.env.SMS_PROVIDER || "twilio",
        apiKey: process.env.SMS_API_KEY || "dev_twilio_api_key",
        from: process.env.SMS_FROM || "+15005550006",
    },

    frontend: {
        baseUrl: process.env.FRONTEND_BASE_URL || "http://localhost:3000",
        encryptRouteParam: process.env.FRONTEND_ENCRYPT_ROUTE_PARAM === "true",
    },

    correlationHeader: process.env.CORRELATION_HEADER || "x-correlation-id",

    cors: {
        allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || "*").split(","),
        allowCredentials: process.env.CORS_ALLOW_CREDENTIALS === "true",
    },
};

export default config;
