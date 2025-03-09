import { groupBy } from 'lodash-es';

import ErrorMessage from '../constants/error-message.js';
import { MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM } from '../constants/index.js';
import { ResponseCode } from '../constants/response-code.js';
import { USER_ROLE } from '../constants/role.js';
import ClinicScheduleModel from '../models/ClinicScheduleModel.js';
import LeaveScheduleModel from '../models/LeaveScheduleModel.js';
import MedicalConsultationHistoryModel from '../models/MedicalConsultationHistoryModel.js';
import MedicalServiceModel from '../models/MedicalServiceModel.js';
import { DoctorModel } from '../models/UserModel.js';
import { getDateFromISOFormat, removeUndefinedFields } from '../utils/index.js';
import ResponseBuilder from '../utils/response-builder.js';
import { checkFieldRequire } from '../utils/validate.js';

// [GET] ${PREFIX_API}/medical-service?clinicId=clinicId&type=type
export const getAllMedicalService = async (req, res) => {
    try {
        const { clinicId, type } = req.query;

        const query = {};
        if (clinicId) {
            query.clinicId = clinicId;
        }
        if (type) {
            query.type = +type;
        }

        const medicalServices = await MedicalServiceModel.find(query);

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get all medical services success')
            .withData(medicalServices)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [GET] ${PREFIX_API}/medical-service/:id
export const getMedicalServiceById = async (req, res) => {
    try {
        const medicalServiceId = req.params.id;
        const checkMedicalService = await MedicalServiceModel.findOne({ _id: medicalServiceId });

        if (!checkMedicalService) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Medical service is not found')
                .build(res);
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get medical service success')
            .withData(checkMedicalService)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [GET] ${PREFIX_API}/medical-service/:id/schedules?date=date
export const getMedicalServiceSchedules = async (req, res) => {
    try {
        const medicalServiceId = req.params.id;
        const { date } = req.query;

        // Kiểm tra xem dịch vụ y tế có tồn tại không
        const checkMedicalService = await MedicalServiceModel.findById(medicalServiceId);
        if (!checkMedicalService) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Medical service is not found')
                .build(res);
        }

        // Lấy tất cả lịch làm việc của phòng khám
        const schedules = await ClinicScheduleModel.find({ clinicId: checkMedicalService.clinicId });
        if (!date) {
            return new ResponseBuilder()
                .withCode(ResponseCode.SUCCESS)
                .withMessage('Get medical service schedules success')
                .withData(schedules)
                .build(res);
        }

        // B1: Lấy danh sách bác sĩ thuộc dịch vụ y tế
        const allDoctors = await DoctorModel.find({ medicalServiceId }, { _id: 1 });
        const allDoctorIds = allDoctors.map((doc) => doc._id);

        // B2: Truy vấn lịch nghỉ và lịch khám
        const [leaveSchedules, workingSchedules] = await Promise.all([
            LeaveScheduleModel.find({
                doctorId: { $in: allDoctorIds },
                date: getDateFromISOFormat(date),
            }).populate('clinicSchedule'),

            MedicalConsultationHistoryModel.find({
                clinicId: checkMedicalService.clinicId,
                clinicScheduleId: { $in: schedules.map((s) => s._id) },
                examinationDate: date,
                status: {
                    $in: [
                        MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM.PENDING,
                        MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM.DONE,
                    ],
                },
            }),
        ]);

        // B3: Nhóm dữ liệu theo clinicScheduleId
        const leaveSchedulesGrouped = groupBy(leaveSchedules, 'clinicScheduleId');
        const workingSchedulesGrouped = groupBy(workingSchedules, 'clinicScheduleId');

        // B4: Lọc ra các ca làm việc có slot trống
        const availableSchedules = schedules.filter((schedule) => {
            const numberSlotInAShift = allDoctors.length;
            const numberOfDoctorLeave = leaveSchedulesGrouped[schedule._id]?.length || 0;
            const numberOfDoctorWorking = workingSchedulesGrouped[schedule._id]?.length || 0;

            return numberSlotInAShift - numberOfDoctorLeave - numberOfDoctorWorking > 0;
        });

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get medical service schedules success')
            .withData(availableSchedules)
            .build(res);
    } catch (error) {
        console.error('Error:', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [POST] ${PREFIX_API}/medical-service
export const createMedicalService = async (req, res) => {
    try {
        const { name, originalPrice, currentPrice, type, clinicId, doctorIds } = req.body;

        if (!checkFieldRequire(name, currentPrice, type, clinicId)) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage(ErrorMessage.MISSING_REQUIRED_FIELDS)
                .build(res);
        }

        const newMedicalService = await MedicalServiceModel.create({
            name,
            originalPrice,
            currentPrice,
            type,
            clinicId,
        });

        await DoctorModel.updateMany(
            {
                _id: { $in: doctorIds },
                role: { $eq: USER_ROLE.DOCTOR },
                medicalServiceId: { $eq: null },
                clinicId: { $eq: clinicId },
            },
            { $set: { medicalServiceId: newMedicalService._id } },
        );

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Create medical service success')
            .withData(newMedicalService)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [PUT] ${PREFIX_API}/medical-service/:id
export const updateMedicalService = async (req, res) => {
    try {
        const medicalServiceId = req.params.id;
        const { name, originalPrice, currentPrice, type, clinicId, doctorIds } = req.body;

        // if (!checkFieldRequire(name, currentPrice, type, clinicId)) {
        //     return new ResponseBuilder()
        //         .withCode(ResponseCode.BAD_REQUEST)
        //         .withMessage(ErrorMessage.MISSING_REQUIRED_FIELDS)
        //         .build(res);
        // }

        const checkMedicalService = await MedicalServiceModel.findOne({ _id: medicalServiceId });

        if (!checkMedicalService) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Medical service is not found')
                .build(res);
        }

        const updatedData = {
            name,
            originalPrice,
            currentPrice,
            type,
            clinicId,
            // doctorIds,
        };

        // Remove undefined values
        removeUndefinedFields(updatedData);

        const newMedicalService = await MedicalServiceModel.findByIdAndUpdate({ _id: medicalServiceId }, updatedData, {
            new: true,
        });

        await DoctorModel.bulkWrite([
            {
                updateMany: {
                    filter: {
                        _id: { $in: doctorIds },
                        role: USER_ROLE.DOCTOR,
                        medicalServiceId: { $eq: null },
                        clinicId: { $eq: newMedicalService.clinicId },
                    },
                    update: { $set: { medicalServiceId: newMedicalService._id } },
                },
            },
            {
                updateMany: {
                    filter: {
                        _id: { $nin: doctorIds },
                        role: USER_ROLE.DOCTOR,
                        medicalServiceId: newMedicalService._id,
                        clinicId: { $eq: newMedicalService.clinicId },
                    },
                    update: { $set: { medicalServiceId: null } },
                },
            },
        ]);

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Update medical service success')
            .withData(newMedicalService)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [DELETE] ${PREFIX_API}/medical-service/:id
export const deleteMedicalService = async (req, res) => {
    try {
        const medicalServiceId = req.params.id;
        const checkMedicalService = await MedicalServiceModel.findOne({ _id: medicalServiceId });

        if (!checkMedicalService) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Medical service is not found')
                .build(res);
        }

        await MedicalServiceModel.deleteOne({ _id: medicalServiceId });

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Delete medical service success')
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
