import { Router } from "express";
import { IncidentController } from "../controller/incidentController";

const router = Router();

router.get("/", IncidentController.getAllIncidents);
router.get("/:id", IncidentController.getIncidentById);
router.delete("/:id", IncidentController.deleteIncident);

export default router;
