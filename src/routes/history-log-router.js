import express from 'express';

import * as historyLogController from '../controllers/historyLogController.js';

const router = express.Router();

// [GET]
router.get('/:userId', historyLogController.getHistoryLogByUserId);

export default router;
