"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employee_controller_1 = require("../controllers/employee.controller");
const requireRole_1 = __importDefault(require("../middlewares/requireRole"));
const router = (0, express_1.Router)();
router.post('/', (0, requireRole_1.default)('admin'), employee_controller_1.createEmployee);
router.get('/:id', (0, requireRole_1.default)('admin', 'engineer'), employee_controller_1.getEmployee);
exports.default = router;
