import { Router } from "express";
import { PrePostCheckController } from "../controller/prePostCheckController";

const router = Router();

router.get("/", PrePostCheckController.getAllPrePostChecks);
router.get("/:id", PrePostCheckController.getPrePostCheckById);
router.post("/", PrePostCheckController.createPrePostCheck);

export default router;
