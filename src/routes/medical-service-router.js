import express from 'express';

import * as medicalServiceController from '../controllers/medicalServiceController.js';
import { authenticateAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// [GET]
router.get('/', medicalServiceController.getAllMedicalService);
router.get('/:id', medicalServiceController.getMedicalServiceById);

// [POST]
router.post('/', authenticateAdmin, medicalServiceController.createMedicalService);

// [PUT]
router.put('/:id/update', authenticateAdmin, medicalServiceController.updateMedicalService);

// [DELETE]
router.delete('/:id/delete', authenticateAdmin, medicalServiceController.deleteMedicalService);

export default router;
