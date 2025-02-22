import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import ResponseBuilder from '../utils/response-builder.js';

dotenv.config();

// Set up cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

// Set up cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'uploads',
        format: async () => 'png',
        public_id: (req, file) => file.originalname.split('.')[0],
    },
});

const upload = multer({ storage });

export const uploadImageMiddleware = async (req, res, next) => {
    try {
        const singleUpload = upload.single('file');
        singleUpload(req, res, (err) => {
            if (err) {
                return new ResponseBuilder()
                    .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
                    .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
                    .build(res);
            }
            return next();
        });
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
