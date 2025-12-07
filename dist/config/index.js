"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Decide which env file to load: .env.dev / .env.qa / .env.prod
const APP_ENV = process.env.APP_ENV || "dev";
dotenv_1.default.config({
    path: path_1.default.join(process.cwd(), `.env.${APP_ENV}`),
});
const config = {
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
exports.default = config;
