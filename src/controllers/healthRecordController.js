import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import * as healthRecordService from '../services/healthRecordService.js';
import ResponseBuilder from '../utils/response-builder.js';

export const getHealthRecordByUserId = async (req, res) => {
    try {
        return await healthRecordService.getHealthRecordByUserId(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const updateHealthRecord = async (req, res) => {
    try {
        return await healthRecordService.updateHealthRecord(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
