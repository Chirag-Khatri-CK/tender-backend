// src/routes/decrypt.debug.ts
import { Router, Request, Response } from "express";
import * as CryptoJS from "crypto-js";
import url from "url";
const router = Router();
const PASS = "dev-secret-passphrase";

/* helpers */
function base64UrlToBase64(b64url?: string) {
    if (!b64url || typeof b64url !== "string") return "";
    let s = b64url.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    return s;
}
function base64ToBase64Url(b64: string) {
    if (!b64 || typeof b64 !== "string") return "";
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function looksLikeBase64Url(s: any) {
    return typeof s === "string" && s.startsWith("U2FsdGVkX1");
}
function looksLikeCryptoJSBase64(s: any) {
    return typeof s === "string" && s.startsWith("U2FsdGVkX1");
}

function decryptCryptoJSBase64(b64orB64Url: string) {
    if (!b64orB64Url) throw new Error("empty ciphertext");
    // Accept either base64url or base64.
    const maybeB64 = (b64orB64Url.indexOf("-") >= 0 || b64orB64Url.indexOf("_") >= 0)
        ? base64UrlToBase64(b64orB64Url)
        : b64orB64Url;
    const plain = CryptoJS.AES.decrypt(maybeB64, PASS as string).toString(CryptoJS.enc.Utf8);
    if (!plain) throw new Error("decryption produced empty plaintext (bad passphrase or corrupted ciphertext)");
    return plain;
}

router.post("/", async (req: Request, res: Response) => {
    if (!PASS) return res.status(500).json({message : "ENCRYPT_PASS missing in environment" });

    try {
        const { fullUrl, token, payload, response: responseCipher } = req.body || {};

        // 1) Extract token (from token or fullUrl)
        let tokenSegment: string | undefined;
        if (token && typeof token === "string") tokenSegment = token;
        else if (fullUrl && typeof fullUrl === "string") {
            try {
                const u = new URL(fullUrl);
                const segs = u.pathname.replace(/^\//, "").split("/").filter(Boolean);
                if (segs.length >= 2 && segs[0] === "e") tokenSegment = segs[1];
                else if (segs.length >= 1 && looksLikeBase64Url(segs[0])) tokenSegment = segs[0];
            } catch (e) {
                // ignore URL parse errors
            }
        }

        if (!tokenSegment) {
            return res.status(400).json({message : "Missing token. Provide 'fullUrl' or 'token' in body." });
        }

        // 2) Decrypt route token (tokenSegment is base64url of CryptoJS base64)
        let decryptedRoute: string;
        try {
            const routeB64 = base64UrlToBase64(tokenSegment);
            decryptedRoute = decryptCryptoJSBase64(routeB64);
        } catch (err: any) {
            return res.status(400).json({message : "Route decryption failed", detail: String(err.message || err) });
        }

        // 3) Decrypt request payload (if provided)
        let decryptedRequest: any = null;
        if (payload && typeof payload === "string") {
            try {
                const plain = decryptCryptoJSBase64(payload); // payload expected as CryptoJS base64
                try { decryptedRequest = JSON.parse(plain); } catch { decryptedRequest = plain; }
            } catch (err: any) {
                return res.status(400).json({message : "Payload decryption failed", detail: String(err.message || err) });
            }
        }

        // 4) Decrypt provided response ciphertext (if provided)
        let decryptedResponse: any = null;
        if (responseCipher && typeof responseCipher === "string") {
            try {
                // response may be base64url or base64 — decryptCryptoJSBase64 handles both
                const plainResp = decryptCryptoJSBase64(responseCipher);
                try { decryptedResponse = JSON.parse(plainResp); } catch { decryptedResponse = plainResp; }
            } catch (err: any) {
                return res.status(400).json({message : "Response decryption failed", detail: String(err.message || err) });
            }
        }

        // 5) Optionally, run internal route to see its raw response (if you want): 
        // You already asked to decrypt values you pass, so we won't auto-invoke internal routes here.
        // If you want to execute the decrypted route and capture its internal response, say so and I will add that.

        // Return everything decrypted
        return res.json({
            route: decryptedRoute,
            request: decryptedRequest,
            responseDecrypted: decryptedResponse
        });
    } catch (err: any) {
        console.error("decrypt debugmessage :", err);
        return res.status(500).json({message : "internal decrypt debug error", detail: String(err.message || err) });
    }
});

export default router;
