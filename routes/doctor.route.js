import express from 'express';
import { getDoctors, getDoctorById } from '../controllers/doctor.controller.js';

const router = express.Router();

router.get('/', 
  (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  }, 
  getDoctors
);

router.get('/:id', getDoctorById); // Add this new route

export default router;