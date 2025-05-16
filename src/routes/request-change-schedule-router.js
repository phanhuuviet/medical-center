import express from 'express';

import * as requestChangeScheduleController from '../controllers/requestChangeScheduleController.js';
import { authenticateAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// [GET]
router.get('/', authenticateAdmin, requestChangeScheduleController.getAllRequestChangeSchedule);
router.get(
    '/:requestChangeScheduleId',
    authenticateAdmin,
    requestChangeScheduleController.getRequestChangeScheduleById,
);

// [POST]
router.post('/', authenticateAdmin, requestChangeScheduleController.createRequestChangeSchedule);

// [PUT]
router.put('/:requestChangeScheduleId', authenticateAdmin, requestChangeScheduleController.updateRequestChangeSchedule);

// [DELETE]
router.delete(
    '/:requestChangeScheduleId',
    authenticateAdmin,
    requestChangeScheduleController.deleteRequestChangeSchedule,
);

export default router;
