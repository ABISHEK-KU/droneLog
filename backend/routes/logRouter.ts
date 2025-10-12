import { Router } from "express";
import multer from "multer";
import { LogUploadController } from "../controller/logUploadController";
import { LogController } from "../controller/logController";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/upload",
  upload.single("logFile"),
  LogUploadController.logUploadController
);
router.get("/", LogController.getAllLogs);
router.get("/:id", LogController.getLogById);
router.delete("/:id", LogController.deleteLogById);

export default router;
