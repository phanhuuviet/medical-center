import ErrorMessage from '../constants/error-message.js';
import { ACTIVE_STATUS } from '../constants/index.js';
import { ResponseCode } from '../constants/response-code.js';
import { USER_ROLE } from '../constants/role.js';
import LeaveScheduleModel from '../models/LeaveScheduleModel.js';
import { leaveScheduleSchema } from '../schemas/leaveSchedule-schema.js';
import { removeFieldsInArrayOfObject } from '../utils/index.js';
import ResponseBuilder from '../utils/response-builder.js';

// [GET] ${PREFIX_API}/leave-schedule/:doctorId
export const getLeaveScheduleByDoctorId = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;

        const leaveSchedule = await LeaveScheduleModel.find({ doctorId }).populate('clinicSchedule').populate('doctor');

        const response = removeFieldsInArrayOfObject(leaveSchedule, ['clinicScheduleId', 'doctorId']);

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get leave schedule success')
            .withData(response)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [POST] ${PREFIX_API}/leave-schedule
export const createLeaveSchedule = async (req, res) => {
    try {
        const { clinicScheduleId, doctorId, date, reason } = req.body;

        const { error } = leaveScheduleSchema.validate({ clinicScheduleId, doctorId, date });
        const messageError = error?.details[0].message;

        if (messageError) {
            return new ResponseBuilder().withCode(ResponseCode.BAD_REQUEST).withMessage(messageError).build(res);
        }

        const checkLeaveSchedule = await LeaveScheduleModel.findOne({ clinicScheduleId, doctorId, date });
        if (checkLeaveSchedule) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Leave schedule is existed')
                .build(res);
        }

        const newLeaveSchedule = await LeaveScheduleModel.create({ clinicScheduleId, doctorId, date, reason });

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Create leave schedule success')
            .withData(newLeaveSchedule)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [PUT] ${PREFIX_API}/leave-schedule/:id/active
export const activeLeaveSchedule = async (req, res) => {
    try {
        const leaveScheduleId = req.params.id;
        const doctorId = req.userId;
        const role = req.role;

        const checkLeaveSchedule = await LeaveScheduleModel.findOne({ _id: leaveScheduleId });

        // Check leave schedule is existed
        if (!checkLeaveSchedule) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Leave schedule is not found')
                .build(res);
        }

        // Check doctorId is match
        if (!(role === USER_ROLE.ADMIN || doctorId === checkLeaveSchedule.doctorId)) {
            return new ResponseBuilder()
                .withCode(ResponseCode.FORBIDDEN)
                .withMessage(ErrorMessage.FORBIDDEN)
                .build(res);
        }

        // Check leave schedule is active
        if (checkLeaveSchedule.status === ACTIVE_STATUS.ACTIVE) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Leave schedule is already active')
                .build(res);
        }

        await LeaveScheduleModel.updateOne({ _id: leaveScheduleId }, { status: ACTIVE_STATUS.ACTIVE });

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Active leave schedule success')
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [PUT] ${PREFIX_API}/leave-schedule/:id/inactive
export const inactiveLeaveSchedule = async (req, res) => {
    try {
        const leaveScheduleId = req.params.id;
        // const doctorId = req.userId;
        // const role = req.role;

        const checkLeaveSchedule = await LeaveScheduleModel.findOne({ _id: leaveScheduleId });

        // Check leave schedule is existed
        if (!checkLeaveSchedule) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Leave schedule is not found')
                .build(res);
        }

        // // Check doctorId is match
        // if (!(role === USER_ROLE.ADMIN || doctorId === checkLeaveSchedule.doctorId)) {
        //     return new ResponseBuilder()
        //         .withCode(ResponseCode.FORBIDDEN)
        //         .withMessage(ErrorMessage.FORBIDDEN)
        //         .build(res);
        // }

        // Check leave schedule is inactive
        if (checkLeaveSchedule.status === ACTIVE_STATUS.INACTIVE) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Leave schedule is already inactive')
                .build(res);
        }

        await LeaveScheduleModel.updateOne({ _id: leaveScheduleId }, { status: ACTIVE_STATUS.INACTIVE });

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Inactive leave schedule success')
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [DELETE] ${PREFIX_API}/leave-schedule/:id
export const deleteLeaveSchedule = async (req, res) => {
    try {
        const leaveScheduleId = req.params.id;
        const doctorId = req.userId;
        const role = req.role;

        const checkLeaveSchedule = await LeaveScheduleModel.findOne({ _id: leaveScheduleId });

        // Check leave schedule is existed
        if (!checkLeaveSchedule) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Leave schedule is not found')
                .build(res);
        }

        // Check doctorId is match
        if (!(role === USER_ROLE.ADMIN || doctorId === checkLeaveSchedule.doctorId)) {
            return new ResponseBuilder()
                .withCode(ResponseCode.FORBIDDEN)
                .withMessage(ErrorMessage.FORBIDDEN)
                .build(res);
        }

        await LeaveScheduleModel.deleteOne({ _id: leaveScheduleId });

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Delete leave schedule success')
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
