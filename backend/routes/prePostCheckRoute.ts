import { Router } from "express";
import { PrePostCheckController } from "../controller/prePostCheckController";

const router = Router();

router.get("/", PrePostCheckController.getAllPrePostChecks);
router.get("/:id", PrePostCheckController.getPrePostCheckById);
router.post("/", PrePostCheckController.createPrePostCheck);
router.put("/:id", PrePostCheckController.updatePrePostCheck);
router.delete("/:id", PrePostCheckController.deletePrePostCheck);

export default router;
