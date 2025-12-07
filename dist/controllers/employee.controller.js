"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmployee = createEmployee;
exports.getEmployee = getEmployee;
const Employee_1 = __importDefault(require("../models/Employee"));
async function createEmployee(req, res) {
    try {
        const payload = req.body;
        const doc = await Employee_1.default.create(payload);
        return res.json({ ok: true, employee: doc });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
}
async function getEmployee(req, res) {
    try {
        const id = req.params.id;
        const doc = await Employee_1.default.findById(id).lean();
        if (!doc)
            return res.status(404).json({ message: 'not found' });
        return res.json({ employee: doc });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
}
