import express from 'express';

import * as clinicScheduleController from '../controllers/clinicScheduleController.js';
import { authenticateAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// [GET]
router.get('/:clinicId', clinicScheduleController.getClinicScheduleByClinicId);

// [POST]
router.post('/', authenticateAdmin, clinicScheduleController.createClinicSchedule);

// [DELETE]
router.delete('/:id/delete', authenticateAdmin, clinicScheduleController.deleteClinicSchedule);

export default router;
