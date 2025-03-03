import { isEmpty, isNil } from 'lodash-es';

import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import ClinicModel from '../models/ClinicModel.js';
import ClinicScheduleModel from '../models/ClinicScheduleModel.js';
import DoctorWorkingScheduleModel from '../models/DoctorWorkingScheduleModel.js';
import { DoctorModel } from '../models/UserModel.js';
import ResponseBuilder from '../utils/response-builder.js';
import { checkFieldRequire } from '../utils/validate.js';

// [GET] ${PREFIX_API}/clinic-schedule/:clinicId
export const getClinicScheduleByClinicId = async (req, res) => {
    try {
        const clinicId = req.params.clinicId;
        const clinicSchedules = await ClinicScheduleModel.find({ clinicId });

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get clinic schedule success')
            .withData(clinicSchedules)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [POST] ${PREFIX_API}/clinic-schedule
export const createClinicSchedule = async (req, res) => {
    try {
        const { clinicId, startTime, endTime } = req.body;
        if (!checkFieldRequire(clinicId, startTime, endTime)) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage(ErrorMessage.MISSING_REQUIRED_FIELDS)
                .build(res);
        }

        // Check clinic is exist
        const checkClinic = await ClinicModel.findById(clinicId);
        if (isNil(checkClinic)) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Clinic is not exist')
                .build(res);
        }

        // Check clinic schedule is exist
        const checkClinicSchedule = await ClinicScheduleModel.findOne({ clinicId, startTime, endTime });
        if (checkClinicSchedule) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Clinic schedule is already exist')
                .build(res);
        }

        // Create new clinic schedule
        const newClinicSchedule = await ClinicScheduleModel.create({
            clinicId,
            startTime,
            endTime,
        });

        // Get all doctor belong to clinic and create record of DoctorWorkingSchedule table
        const allDoctorBelongToClinic = await DoctorModel.find({ clinicId });
        if (!isEmpty(allDoctorBelongToClinic)) {
            const queryInsert = allDoctorBelongToClinic.map((doctor) => ({
                insertOne: {
                    document: {
                        doctorId: doctor._id,
                        clinicScheduleId: newClinicSchedule._id,
                    },
                },
            }));

            await DoctorWorkingScheduleModel.bulkWrite(queryInsert);
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Create clinic schedule success')
            .withData(newClinicSchedule)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [DELETE] ${PREFIX_API}/clinic-schedule/:id
export const deleteClinicSchedule = async (req, res) => {
    try {
        const clinicScheduleId = req.params.id;
        const checkClinicSchedule = await ClinicScheduleModel.findById(clinicScheduleId);

        if (isNil(checkClinicSchedule)) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Clinic schedule is not found')
                .build(res);
        }

        // delete clinic schedule and doctor working schedule
        await Promise.all([
            ClinicScheduleModel.findByIdAndDelete(clinicScheduleId),
            DoctorWorkingScheduleModel.deleteMany({ clinicScheduleId }),
        ]);

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Delete clinic schedule success')
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
