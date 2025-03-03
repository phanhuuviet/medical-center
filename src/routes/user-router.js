import express from 'express';

import * as userController from '../controllers/userController.js';
import {
    authenticateAdmin,
    authenticateSelfUserOrAdminMiddleware,
    authenticateToken,
} from '../middlewares/authMiddleware.js';
import { uploadImageMiddleware } from '../middlewares/imageMiddleware.js';

const router = express.Router();

// [GET]
router.get('/', authenticateAdmin, userController.getAllUsers);
router.get('/me', authenticateToken, userController.getMe);
router.get('/:id', userController.getUserById);

// [PORT]
router.post('/create-doctor', authenticateAdmin, userController.createDoctor);

// [PUT]
router.put('/:id/update', authenticateSelfUserOrAdminMiddleware, userController.updateUser);
router.put(
    '/:id/update-avatar',
    authenticateSelfUserOrAdminMiddleware,
    uploadImageMiddleware,
    userController.updateAvatar,
);

// [DELETE]
router.delete('/:id/delete', authenticateAdmin, userController.deleteUser);

export default router;
