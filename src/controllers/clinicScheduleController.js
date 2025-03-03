import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import * as clinicScheduleService from '../services/clinicScheduleService.js';
import ResponseBuilder from '../utils/response-builder.js';

export const getClinicScheduleByClinicId = async (req, res) => {
    try {
        return await clinicScheduleService.getClinicScheduleByClinicId(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const createClinicSchedule = async (req, res) => {
    try {
        return await clinicScheduleService.createClinicSchedule(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const deleteClinicSchedule = async (req, res) => {
    try {
        return await clinicScheduleService.deleteClinicSchedule(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
