import { Router } from "express";
import { DroneController } from "../controller/droneController";

const router = Router();

router.post("/add", DroneController.addNewDrone);
router.put("/edit/:id", DroneController.editDrone);
router.get("/getallDrones", DroneController.getAllDrone);
router.delete("/delete/:id", DroneController.deleteDrone);

export default router;
