import express from 'express';

import * as medicalConsultationHistoryController from '../controllers/medicalConsultationHistoryController.js';
import { authenticateAdmin, authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// [GET]
router.get('/', authenticateToken, medicalConsultationHistoryController.getAllMedicalConsultationHistory);
router.get('/:id', authenticateToken, medicalConsultationHistoryController.getMedicalConsultationHistoryById);

// [POST]
router.post('/', authenticateAdmin, medicalConsultationHistoryController.createMedicalConsultationHistory);

// [PUT]
router.put('/:id/update', authenticateToken, medicalConsultationHistoryController.updateMedicalConsultationHistory);
router.put('/:id/cancel', authenticateAdmin, medicalConsultationHistoryController.cancelMedicalConsultationHistory);
router.put('/:id/complete', authenticateAdmin, medicalConsultationHistoryController.completeMedicalConsultationHistory);

// [DELETE]
router.delete('/:id/delete', authenticateAdmin, medicalConsultationHistoryController.deleteMedicalConsultationHistory);

export default router;
