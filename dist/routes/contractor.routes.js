"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contractor_controller_1 = require("../controllers/contractor.controller");
const requireRole_1 = __importDefault(require("../middlewares/requireRole"));
const router = (0, express_1.Router)();
router.post('/', (0, requireRole_1.default)('admin', 'contractor'), contractor_controller_1.createContractor);
router.get('/:id', contractor_controller_1.getContractor);
exports.default = router;
