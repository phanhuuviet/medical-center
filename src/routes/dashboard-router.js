import express from 'express';

import * as dashboardController from '../controllers/dashboardController.js';
import { authenticateAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// [GET]
router.get('/medical-consultation-history', authenticateAdmin, dashboardController.getMedicalConsultationHistory);
router.get('/doctor', authenticateAdmin, dashboardController.getDoctorDashboard);
router.get('/patient', authenticateAdmin, dashboardController.getPatientDashboard);
router.get('/revenue', authenticateAdmin, dashboardController.getRevenueDashboard);

export default router;
