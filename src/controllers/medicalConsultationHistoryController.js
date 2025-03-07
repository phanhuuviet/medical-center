import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import * as medicalConsultationHistoryService from '../services/medicalConsultationHistoryService.js';
import ResponseBuilder from '../utils/response-builder.js';

export const getAllMedicalConsultationHistory = async (req, res) => {
    try {
        return await medicalConsultationHistoryService.getAllMedicalConsultationHistory(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const createMedicalConsultationHistory = async (req, res) => {
    try {
        return await medicalConsultationHistoryService.createMedicalConsultationHistory(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const getMedicalConsultationHistoryById = async (req, res) => {
    try {
        return await medicalConsultationHistoryService.getMedicalConsultationHistoryById(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const updateMedicalConsultationHistory = async (req, res) => {
    try {
        return await medicalConsultationHistoryService.updateMedicalConsultationHistory(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const cancelMedicalConsultationHistory = async (req, res) => {
    try {
        return await medicalConsultationHistoryService.cancelMedicalConsultationHistory(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const completeMedicalConsultationHistory = async (req, res) => {
    try {
        return await medicalConsultationHistoryService.completeMedicalConsultationHistory(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const deleteMedicalConsultationHistory = async (req, res) => {
    try {
        return await medicalConsultationHistoryService.deleteMedicalConsultationHistory(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
