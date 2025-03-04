import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import { USER_ROLE } from '../constants/role.js';
import LeaveScheduleModel from '../models/LeaveScheduleModel.js';
import { removeFieldsInArrayOfObject } from '../utils/index.js';
import ResponseBuilder from '../utils/response-builder.js';
import { checkFieldRequire } from '../utils/validate.js';

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

        if (!checkFieldRequire(clinicScheduleId, doctorId, date)) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage(ErrorMessage.MISSING_REQUIRED_FIELDS)
                .build(res);
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
