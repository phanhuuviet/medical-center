import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import * as dashboardService from '../services/dashboardService.js';
import ResponseBuilder from '../utils/response-builder.js';

export const getMedicalConsultationHistory = async (req, res) => {
    try {
        return await dashboardService.getMedicalConsultationHistory(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const getDoctorDashboard = async (req, res) => {
    try {
        return await dashboardService.getDoctorDashboard(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const getPatientDashboard = async (req, res) => {
    try {
        return await dashboardService.getPatientDashboard(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
