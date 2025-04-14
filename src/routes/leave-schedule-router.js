import express from 'express';

import * as leaveScheduleController from '../controllers/LeaveScheduleController.js';
import { authenticateSelfUserOrAdminMiddleware, authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// [GET]
router.get('/:doctorId', authenticateSelfUserOrAdminMiddleware, leaveScheduleController.getLeaveScheduleByDoctorId);

// [PUT]
router.put('/:id/active', authenticateToken, leaveScheduleController.activeLeaveSchedule);
router.put('/:id/inactive', authenticateToken, leaveScheduleController.inactiveLeaveSchedule);

// [POST]
router.post('/', authenticateToken, leaveScheduleController.createLeaveSchedule);

// [DELETE]
router.delete('/:id', authenticateToken, leaveScheduleController.deleteLeaveSchedule);

export default router;
