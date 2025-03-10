import express from 'express';

import * as medicalServiceController from '../controllers/medicalServiceController.js';
import { authenticateAdmin } from '../middlewares/authMiddleware.js';
import { uploadImageMiddleware } from '../middlewares/imageMiddleware.js';

const router = express.Router();

// [GET]
router.get('/', medicalServiceController.getAllMedicalService);
router.get('/:id', medicalServiceController.getMedicalServiceById);
router.get('/:id/schedules', medicalServiceController.getMedicalServiceSchedules);

// [POST]
router.post('/', authenticateAdmin, medicalServiceController.createMedicalService);

// [PUT]
router.put('/:id/update', authenticateAdmin, medicalServiceController.updateMedicalService);
router.put('/:id/update-logo', authenticateAdmin, uploadImageMiddleware, medicalServiceController.updateLogo);

// [DELETE]
router.delete('/:id/delete', authenticateAdmin, medicalServiceController.deleteMedicalService);

export default router;
