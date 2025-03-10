import express from 'express';

import * as clinicController from '../controllers/clinicController.js';
import { authenticateAdmin } from '../middlewares/authMiddleware.js';
import { uploadImageMiddleware } from '../middlewares/imageMiddleware.js';

const router = express.Router();

// [GET]
router.get('/', clinicController.getAllClinic);
router.get('/:id', clinicController.getClinicById);

// [POST]
router.post('/', authenticateAdmin, clinicController.createClinic);

// [PUT]
router.put('/:id/update', authenticateAdmin, clinicController.updateClinic);
router.put('/:id/update-logo', authenticateAdmin, uploadImageMiddleware, clinicController.updateLogoClinic);
router.put('/:id/active', authenticateAdmin, clinicController.activeClinic);
router.put('/:id/inActive', authenticateAdmin, clinicController.inActiveClinic);

// [DELETE]
router.delete('/:id/delete', authenticateAdmin, clinicController.deleteClinic);

export default router;
