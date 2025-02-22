import express from 'express';

import * as utilController from '../controllers/utilController.js';
import { uploadImageMiddleware } from '../middlewares/imageMiddleware.js';

const router = express.Router();

router.post('/upload-file', uploadImageMiddleware, utilController.uploadImage);

export default router;
