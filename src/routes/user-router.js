import express from 'express';

import * as userController from '../controllers/userController.js';
import {
    authenticateAdmin,
    authenticateAdminOrDoctor,
    authenticateSelfUserOrAdminMiddleware,
    authenticateToken,
} from '../middlewares/authMiddleware.js';
import { uploadImageMiddleware } from '../middlewares/imageMiddleware.js';

const router = express.Router();

// [GET]
router.get('/', authenticateAdmin, userController.getAllUsers);
router.get('/me', authenticateToken, userController.getMe);
router.get('/:id', userController.getUserById);

// [PUT]
router.put('/:id/update', authenticateToken, userController.updateUser);
router.put(
    '/:id/update-avatar',
    authenticateSelfUserOrAdminMiddleware,
    uploadImageMiddleware,
    userController.updateAvatar,
);

// [DELETE]
router.delete('/:id/delete', authenticateAdmin, userController.deleteUser);

// ======= DOCTOR ROUTER =========
// [GET]
router.get('/:doctorId/schedules', userController.getDoctorSchedules);
router.get('/:doctorId/patients', userController.getAllPatientsByDoctor);
router.get('/:doctorId/working-schedules', userController.getDoctorWorkingSchedules);

// [PORT]
router.post('/create-doctor', authenticateAdmin, userController.createDoctor);

// [PUT]
router.put('/:doctorId/update-doctor', authenticateAdminOrDoctor, userController.updateDoctor);

export default router;
