import express from 'express';

import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/me', authenticateToken, userController.getMe);

export default router;
