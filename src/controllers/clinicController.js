import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import * as clinicService from '../services/clinicService.js';
import ResponseBuilder from '../utils/response-builder.js';

export const getAllClinic = async (req, res) => {
    try {
        return await clinicService.getAllClinic(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const createClinic = async (req, res) => {
    try {
        return await clinicService.createClinic(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const getClinicById = async (req, res) => {
    try {
        return await clinicService.getClinicById(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const updateClinic = async (req, res) => {
    try {
        return await clinicService.updateClinic(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const updateLogoClinic = async (req, res) => {
    try {
        return await clinicService.updateLogo(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const deleteClinic = async (req, res) => {
    try {
        return await clinicService.deleteClinic(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
