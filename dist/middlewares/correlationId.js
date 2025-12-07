"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const config_1 = __importDefault(require("../config"));
exports.default = (req, res, next) => {
    const header = req.header(config_1.default.correlationHeader || 'x-correlation-id');
    const id = header && header.trim().length > 0 ? header : (0, crypto_1.randomUUID)();
    res.setHeader(config_1.default.correlationHeader || 'x-correlation-id', id);
    req.correlationId = id;
    res.locals.correlationId = id;
    next();
};
