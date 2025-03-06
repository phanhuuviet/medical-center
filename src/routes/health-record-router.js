import express from 'express';

import * as healthRecordController from '../controllers/healthRecordController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// [GET]
router.get('/:userId', authenticateToken, healthRecordController.getHealthRecordByUserId);

// [PUT]
router.put('/:userId', authenticateToken, healthRecordController.updateHealthRecord);

export default router;
