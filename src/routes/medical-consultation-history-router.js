import express from 'express';

import * as medicalConsultationHistoryController from '../controllers/medicalConsultationHistoryController.js';
import { authenticateAdmin, authenticateAdminOrDoctor, authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// [GET]
router.get('/', authenticateToken, medicalConsultationHistoryController.getAllMedicalConsultationHistory);
router.get('/:id', authenticateToken, medicalConsultationHistoryController.getMedicalConsultationHistoryById);

// [POST]
router.post('/', authenticateToken, medicalConsultationHistoryController.createMedicalConsultationHistory);

// [PUT]
router.put(
    '/:id/update',
    authenticateAdminOrDoctor,
    medicalConsultationHistoryController.updateMedicalConsultationHistory,
);
router.put('/:id/cancel', authenticateToken, medicalConsultationHistoryController.cancelMedicalConsultationHistory);
router.put(
    '/:id/complete',
    authenticateAdminOrDoctor,
    medicalConsultationHistoryController.completeMedicalConsultationHistory,
);

// [DELETE]
router.delete('/:id/delete', authenticateAdmin, medicalConsultationHistoryController.deleteMedicalConsultationHistory);

export default router;
