import express from "express";
import * as controller from "../controllers/tender.controller";
const router = express.Router();

router.post("/", controller.createTender);
router.get("/list", controller.listTenders);          
router.get("/:id", controller.getTender);      
router.patch("/:id", controller.updateTender);
router.delete("/:id", controller.softDeleteTender);
router.post("/:id/cancel", controller.cancelTender);

export default router;
