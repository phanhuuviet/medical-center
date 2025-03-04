import express from 'express';

import * as leaveScheduleController from '../controllers/LeaveScheduleController.js';
import { authenticateSelfUserOrAdminMiddleware, authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// [GET]
router.get('/:doctorId', authenticateSelfUserOrAdminMiddleware, leaveScheduleController.getLeaveScheduleByDoctorId);

// [POST]
router.post('/', authenticateSelfUserOrAdminMiddleware, leaveScheduleController.createLeaveSchedule);

// [DELETE]
router.delete('/:id', authenticateToken, leaveScheduleController.deleteLeaveSchedule);

export default router;
