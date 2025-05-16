import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import * as requestChangeScheduleService from '../services/requestChangeScheduleService.js';
import ResponseBuilder from '../utils/response-builder.js';

export const getAllRequestChangeSchedule = async (req, res) => {
    try {
        return await requestChangeScheduleService.getAllRequestChangeSchedule(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const getRequestChangeScheduleById = async (req, res) => {
    try {
        return await requestChangeScheduleService.getRequestChangeScheduleById(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const createRequestChangeSchedule = async (req, res) => {
    try {
        return await requestChangeScheduleService.createRequestChangeSchedule(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const updateRequestChangeSchedule = async (req, res) => {
    try {
        return await requestChangeScheduleService.updateRequestChangeSchedule(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const deleteRequestChangeSchedule = async (req, res) => {
    try {
        return await requestChangeScheduleService.deleteRequestChangeSchedule(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
