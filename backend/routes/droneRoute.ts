import { Router } from "express";
import { DroneController } from "../controller/droneController";

const router = Router();

router.post("/add", DroneController.addNewDrone);
router.put("/edit/:id", DroneController.editDrone);
router.get("/all", DroneController.getAllDrone);

export default router;
