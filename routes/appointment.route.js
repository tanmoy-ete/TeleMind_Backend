import express from "express";
import { 
  createAppointment, 
  confirmAppointment,
  getAppointmentDetails 
} from "../controllers/appointment.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createAppointment);
router.put("/confirm", protect, confirmAppointment);
router.get("/:id", protect, getAppointmentDetails); // Add this new route

export default router;