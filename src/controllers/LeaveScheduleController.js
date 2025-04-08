import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import * as leaveScheduleService from '../services/leaveScheduleService.js';
import ResponseBuilder from '../utils/response-builder.js';

export const getLeaveScheduleByDoctorId = async (req, res) => {
    try {
        return await leaveScheduleService.getLeaveScheduleByDoctorId(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const activeLeaveSchedule = async (req, res) => {
    try {
        return await leaveScheduleService.activeLeaveSchedule(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const inactiveLeaveSchedule = async (req, res) => {
    try {
        return await leaveScheduleService.inactiveLeaveSchedule(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const createLeaveSchedule = async (req, res) => {
    try {
        return await leaveScheduleService.createLeaveSchedule(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const deleteLeaveSchedule = async (req, res) => {
    try {
        return await leaveScheduleService.deleteLeaveSchedule(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
