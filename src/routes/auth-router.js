import express from 'express';

import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/sign-in', authController.signIn);
router.post('/sign-up', authController.signUp);
router.post('/refresh-token', authController.refreshToken);

export default router;
