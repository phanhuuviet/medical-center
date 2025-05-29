import { startOfDay } from 'date-fns';

import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import ClinicModel from '../models/ClinicModel.js';
import RequestChangeScheduleModel from '../models/RequestChangeScheduleModel.js';
import ResponseBuilder from '../utils/response-builder.js';

// [GET] ${PREFIX_API}/request-change-schedule?clinicId=:clinicId&applyDate=:applyDate
export const getAllRequestChangeSchedule = async (req, res) => {
    try {
        const { clinicId, applyDate } = req.query;
        const query = {};

        if (clinicId) {
            query.clinicId = clinicId;
        }

        if (applyDate) {
            const startOfApplyDate = startOfDay(new Date(applyDate));
            query.applyDate = { $gte: startOfApplyDate };
        }

        const requestChangeSchedule = await RequestChangeScheduleModel.find(query)
            .populate('clinicId')
            .populate('newValue.clinicScheduleId');

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get all request change schedule success')
            .withData(requestChangeSchedule)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [GET] ${PREFIX_API}/request-change-schedule/:requestChangeScheduleId
export const getRequestChangeScheduleById = async (req, res) => {
    try {
        const requestChangeScheduleId = req.params.requestChangeScheduleId;

        const requestChangeSchedule = await RequestChangeScheduleModel.findById(requestChangeScheduleId)
            .populate('clinicId')
            .populate('newValue');

        if (!requestChangeSchedule) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Request change schedule not found')
                .build(res);
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get request change schedule success')
            .withData(requestChangeSchedule)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [POST] ${PREFIX_API}/request-change-schedule
export const createRequestChangeSchedule = async (req, res) => {
    try {
        const { name, clinicId, applyDate, newValue } = req.body;

        const startOfApplyDate = startOfDay(new Date(applyDate));

        if (!newValue?.length) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('New value is required')
                .build(res);
        }

        // So sánh applyDate với ngày hiện tại phải cách nhau 30 ngày
        const currentDate = new Date();
        const applyDateObj = new Date(startOfApplyDate);
        const diffTime = Math.abs(applyDateObj - currentDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 30) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Apply date must be at least 30 days from now')
                .build(res);
        }

        // Kiểm tra xem clinicId có tồn tại trong cơ sở dữ liệu hay không
        const checkClinic = await ClinicModel.findOne({ _id: clinicId });
        if (!checkClinic) {
            return new ResponseBuilder().withCode(ResponseCode.BAD_REQUEST).withMessage('Clinic not found').build(res);
        }

        // Kiểm tra xem newValue có tồn tại trong cơ sở dữ liệu hay không
        // for (const item of newValue) {
        //     const checkNewValue = await ClinicModel.findOne({ _id: item.clinicScheduleId });
        //     if (!checkNewValue) {
        //         return new ResponseBuilder()
        //             .withCode(ResponseCode.BAD_REQUEST)
        //             .withMessage('New value not found')
        //             .build(res);
        //     }
        // }

        const requestChangeSchedule = await RequestChangeScheduleModel.create({
            name,
            clinicId,
            applyDate: startOfApplyDate,
            newValue,
        });

        return new ResponseBuilder()
            .withCode(ResponseCode.CREATED)
            .withMessage('Create request change schedule success')
            .withData(requestChangeSchedule)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [PUT] ${PREFIX_API}/request-change-schedule/:requestChangeScheduleId
export const updateRequestChangeSchedule = async (req, res) => {
    try {
        const requestChangeScheduleId = req.params.requestChangeScheduleId;
        const { name, clinicId, applyDate, newValue } = req.body;

        if (!newValue?.length) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('New value is required')
                .build(res);
        }

        const requestChangeSchedule = await RequestChangeScheduleModel.findByIdAndUpdate(
            requestChangeScheduleId,
            {
                name,
                clinicId,
                applyDate,
                newValue,
            },
            { new: true },
        );

        if (!requestChangeSchedule) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Request change schedule not found')
                .build(res);
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Update request change schedule success')
            .withData(requestChangeSchedule)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [DELETE] ${PREFIX_API}/request-change-schedule/:requestChangeScheduleId
export const deleteRequestChangeSchedule = async (req, res) => {
    try {
        const requestChangeScheduleId = req.params.requestChangeScheduleId;

        const requestChangeSchedule = await RequestChangeScheduleModel.findByIdAndDelete(requestChangeScheduleId);

        if (!requestChangeSchedule) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Request change schedule not found')
                .build(res);
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Delete request change schedule success')
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
