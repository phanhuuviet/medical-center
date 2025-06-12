import mongoose from 'mongoose';

import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import MedicalServiceModel from '../models/MedicalServiceModel.js';
import ResponseBuilder from '../utils/response-builder.js';

// [POST] ${PREFIX_API}/util/upload-file
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Please upload image')
                .build(res);
        }
        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Upload image successfully')
            .withData(req.file)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [...] ${PREFIX_API}/util/test-api
export const testAPI = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const updateData = req.body;

        for (const item of updateData) {
            const { id, description, symptom, relatedService } = item;

            await MedicalServiceModel.findByIdAndUpdate(
                id,
                {
                    description,
                    symptom,
                    relatedService,
                },
                { session },
            );
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Cập nhật thành công tất cả dịch vụ y tế' });
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
