"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
router.post('/', admin_controller_1.createAdmin);
router.patch('/:id', admin_controller_1.updateAdmin);
router.get('/:id', admin_controller_1.getAdmin);
exports.default = router;
