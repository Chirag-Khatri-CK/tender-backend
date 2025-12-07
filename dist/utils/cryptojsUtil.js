"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomBytesBase64 = randomBytesBase64;
// src/utils/cryptojsUtil.ts
const crypto_js_1 = __importDefault(require("crypto-js"));
function randomBytesBase64(len = 32) {
    // len = number of random bytes
    const wa = crypto_js_1.default.lib.WordArray.random(len);
    return crypto_js_1.default.enc.Base64.stringify(wa);
}
