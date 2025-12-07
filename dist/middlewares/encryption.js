"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = encryptionMiddleware;
const CryptoJS = __importStar(require("crypto-js"));
const url_1 = __importDefault(require("url"));
/**
 * Robust encryption middleware (TypeScript / ESM) with bypass support
 *
 * - Decrypts route token (base64url of CryptoJS ciphertext) and rewrites req.url
 * - Decrypts incoming payload: { payload: "<CryptoJS base64>" } => req.body
 * - Captures outgoing response (json/send/end/write) and if it's JSON, encrypts and returns { data: "<base64url>" }
 *
 * Bypass config:
 *  - config.security.encryptBypass = ['/debug/decrypt', '/health', '/public/*']
 *  - or env ENCRYPT_BYPASS='/debug/decrypt,/health,/public/*'
 *
 * Debug: set DEBUG_ENCRYPT_MW="true"
 * Enable: config.security.encryptPayload === true OR process.env.ENCRYPT_PAYLOAD === "true"
 *
 * Note: Keep bodyParser.json() mounted BEFORE this middleware.
 */
function base64ToBase64Url(b64) {
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function base64UrlToBase64(b64url) {
    let s = b64url.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4)
        s += "=";
    return s;
}
function isLikelyCryptoJSToken(segment) {
    return typeof segment === "string" && /^[A-Za-z0-9\-_]{10,}$/.test(segment) && segment.startsWith("U2FsdGVkX1");
}
/** Normalize path: ensure leading slash, no trailing slash (except root), lowercase */
function normalizePath(p) {
    if (!p)
        return "/";
    try {
        // if it's a full URL, parse pathname
        if (p.includes("://")) {
            const u = new URL(p);
            p = u.pathname + (u.search || "");
        }
    }
    catch {
        // ignore
    }
    let s = String(p).trim();
    if (!s.startsWith("/"))
        s = "/" + s;
    if (s.length > 1 && s.endsWith("/"))
        s = s.slice(0, -1);
    return s.toLowerCase();
}
/** Check if request path matches a bypass pattern.
 *  Pattern forms:
 *   - exact: /debug/decrypt
 *   - wildcard prefix: /debug/* matches /debug/foo and /debug/foo/bar
 */
function matchesBypass(reqPath, pattern) {
    const rp = normalizePath(reqPath);
    const pat = String(pattern || "").trim().toLowerCase();
    if (!pat)
        return false;
    // allow wildcard suffix
    if (pat.endsWith("*")) {
        const prefix = pat.replace(/\*+$/, "");
        return rp.startsWith(prefix);
    }
    // exact match
    return rp === normalizePath(pat);
}
function encryptionMiddleware(config) {
    const cfg = config ?? {};
    const enabled = !!(cfg?.security?.encryptPayload === true || process.env.ENCRYPT_PAYLOAD === "true");
    const passphrase = process.env.ENCRYPT_PASS ?? cfg?.ENCRYPT_PASS;
    const debug = process.env.DEBUG_ENCRYPT_MW === "true";
    if (enabled && !passphrase) {
        throw new Error("ENCRYPT_PASS is required when encryptPayload is enabled.");
    }
    // Build bypass list: config -> env -> default empty
    const configBypass = Array.isArray(cfg?.security?.encryptBypass) ? cfg.security.encryptBypass : [];
    const envBypass = process.env.ENCRYPT_BYPASS ? process.env.ENCRYPT_BYPASS.split(",").map(s => s.trim()).filter(Boolean) : [];
    // default safeguard: do NOT add debug route automatically here; let user set it intentionally
    const bypassList = [...configBypass, ...envBypass];
    const MAX_BUFFER_BYTES = Number(process.env.ENCRYPT_MW_MAX_BYTES ?? 5 * 1024 * 1024); // 5MB default
    function dlog(...args) { if (debug)
        console.log("[encrypt-mw]", ...args); }
    function decryptCryptoJSBase64(b64cipher) {
        const bytes = CryptoJS.AES.decrypt(b64cipher, passphrase);
        const plain = bytes.toString(CryptoJS.enc.Utf8);
        if (!plain)
            throw new Error("Decryption failed (bad passphrase or corrupted ciphertext)");
        return plain;
    }
    function encryptToCryptoJSBase64(plain) {
        return CryptoJS.AES.encrypt(plain, passphrase).toString();
    }
    return function (req, res, next) {
        // If encryption not enabled, skip
        if (!enabled)
            return next();
        // if request matches any bypass pattern, skip middleware entirely
        try {
            const reqPath = (req.path || req.url || "/").toString();
            for (const pat of bypassList) {
                if (matchesBypass(reqPath, pat)) {
                    dlog("skipping encryption middleware for bypass path:", reqPath, pat);
                    return next();
                }
            }
        }
        catch (e) {
            // on any failure in bypass check, continue into middleware (safer)
            dlog("bypass checkmessage :", e);
        }
        dlog("incoming", req.method, req.path);
        // ---------- 1) Route token detection & decryption ----------
        try {
            const originalPath = req.path || req.url || "/";
            const segments = originalPath.replace(/^\//, "").split("/").filter(Boolean);
            let tokenB64url = null;
            if (segments.length >= 2 && segments[0] === "e") {
                tokenB64url = segments[1];
            }
            else if (segments.length >= 1 && isLikelyCryptoJSToken(segments[0])) {
                tokenB64url = segments[0];
            }
            if (tokenB64url) {
                const tokenB64 = base64UrlToBase64(tokenB64url);
                let decryptedRoute;
                try {
                    decryptedRoute = decryptCryptoJSBase64(tokenB64);
                }
                catch (err) {
                    dlog("route decrypt failed", err);
                    return res.status(400).json({ message: "Route token decryption failed" });
                }
                const parsed = url_1.default.parse(decryptedRoute);
                const newPath = (parsed.pathname || "/") + (parsed.search || "");
                req.url = newPath;
                req.originalUrl = newPath;
                dlog("rewrote url ->", req.url);
            }
        }
        catch (err) {
            console.error("encrypt-mw routemessage :", err);
            return res.status(500).json({ message: "encryption middleware error (route)" });
        }
        // ---------- 2) Decrypt incoming payload ----------
        try {
            if (req.body && typeof req.body === "object" && Object.prototype.hasOwnProperty.call(req.body, "payload")) {
                const encPayload = String(req.body.payload);
                let plainJson;
                try {
                    plainJson = decryptCryptoJSBase64(encPayload);
                }
                catch (err) {
                    dlog("payload decrypt failed", err);
                    return res.status(400).json({ message: "Payload decryption failed" });
                }
                try {
                    req.body = plainJson ? JSON.parse(plainJson) : {};
                    dlog("decrypted req.body:", JSON.stringify(req.body).slice(0, 200));
                }
                catch (err) {
                    dlog("payload JSON parse failed", err);
                    return res.status(400).json({ message: "Payload JSON parse failed" });
                }
            }
        }
        catch (err) {
            console.error("encrypt-mw payloadmessage :", err);
            return res.status(500).json({ message: "encryption middleware error (payload)" });
        }
        // ---------- 3) Intercept outgoing response ----------
        const originalWrite = res.write.bind(res);
        const originalEnd = res.end.bind(res);
        const originalJson = res.json?.bind(res);
        const originalSend = res.send?.bind(res);
        let bufferChunks = [];
        let ended = false;
        let sentDirectly = false;
        function flushEncryptedJsonString(jsonString) {
            try {
                if (res.headersSent) {
                    dlog("headers already sent, cannot encrypt response");
                    return;
                }
                const statusCode = Number(res.statusCode) || 200;
                const encryptedB64 = encryptToCryptoJSBase64(jsonString);
                const encryptedBase64Url = base64ToBase64Url(encryptedB64);
                const payload = JSON.stringify({ data: encryptedBase64Url });
                // set headers & length
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                res.setHeader("Content-Length", Buffer.byteLength(payload, "utf8"));
                res.statusCode = statusCode;
                dlog("sending encrypted response, status:", statusCode, "len:", Buffer.byteLength(payload, "utf8"));
                sentDirectly = true;
                ended = true;
                return originalEnd(Buffer.from(payload, "utf8"));
            }
            catch (err) {
                console.error("encrypt-mw flushmessage :", err);
                try {
                    if (!res.headersSent) {
                        const fallback = JSON.stringify({ message: "response encryption failed" });
                        res.setHeader("Content-Type", "application/json; charset=utf-8");
                        res.setHeader("Content-Length", Buffer.byteLength(fallback, "utf8"));
                        sentDirectly = true;
                        ended = true;
                        return originalEnd(Buffer.from(fallback, "utf8"));
                    }
                }
                catch (_) { /* swallow */ }
            }
        }
        // override write: buffer data (unless we already sent)
        res.write = function (chunk, ...args) {
            try {
                if (sentDirectly)
                    return originalWrite(chunk, ...args);
                const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk), args[1] || "utf8");
                bufferChunks.push(buf);
                return true;
            }
            catch (err) {
                dlog("write override error", err);
                return originalWrite(chunk, ...args);
            }
        };
        // override end: finalize buffer and decide to encrypt or passthrough
        res.end = function (chunk, ...args) {
            try {
                if (ended)
                    return;
                if (chunk) {
                    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk), args[0] || "utf8");
                    bufferChunks.push(buf);
                }
                if (bufferChunks.length === 0) {
                    ended = true;
                    return originalEnd(chunk, ...args);
                }
                const full = Buffer.concat(bufferChunks);
                const contentTypeHeader = (res.getHeader("Content-Type") || "").toString().toLowerCase();
                const isJsonByHeader = contentTypeHeader.includes("application/json");
                const smallEnough = full.length <= MAX_BUFFER_BYTES;
                const bodyText = full.toString("utf8");
                if (!smallEnough) {
                    dlog("response too large to buffer -> passthrough");
                    ended = true;
                    sentDirectly = true;
                    return originalEnd(full, ...args);
                }
                let parsed = null;
                let shouldEncrypt = false;
                if (isJsonByHeader) {
                    shouldEncrypt = true;
                }
                else {
                    try {
                        parsed = JSON.parse(bodyText);
                        shouldEncrypt = true;
                    }
                    catch (_) {
                        shouldEncrypt = false;
                    }
                }
                if (shouldEncrypt) {
                    const jsonString = parsed ? JSON.stringify(parsed) : bodyText;
                    return flushEncryptedJsonString(jsonString);
                }
                else {
                    dlog("non-JSON response -> passthrough");
                    ended = true;
                    sentDirectly = true;
                    return originalEnd(full, ...args);
                }
            }
            catch (err) {
                console.error("encrypt-mw endmessage :", err);
                try {
                    ended = true;
                    return originalEnd(chunk, ...args);
                }
                catch (_) { /* swallow */ }
            }
        };
        // override res.json and res.send to directly encrypt
        res.json = function (body) {
            if (ended)
                return;
            const jsonString = typeof body === "string" ? body : JSON.stringify(body ?? {});
            return flushEncryptedJsonString(jsonString);
        };
        res.send = function (body) {
            if (ended)
                return;
            if (Buffer.isBuffer(body)) {
                try {
                    const parsed = JSON.parse(body.toString("utf8"));
                    return flushEncryptedJsonString(JSON.stringify(parsed));
                }
                catch (_) {
                    ended = true;
                    sentDirectly = true;
                    return originalEnd(body);
                }
            }
            else if (typeof body === "string") {
                try {
                    const parsed = JSON.parse(body);
                    return flushEncryptedJsonString(JSON.stringify(parsed));
                }
                catch (_) {
                    ended = true;
                    sentDirectly = true;
                    return originalEnd(Buffer.from(body, "utf8"));
                }
            }
            else {
                return flushEncryptedJsonString(JSON.stringify(body ?? {}));
            }
        };
        // proceed to next
        try {
            return next();
        }
        catch (err) {
            console.error("encrypt-mw nextmessage :", err);
            return next(err);
        }
    };
}
