import { endOfDay, startOfDay } from 'date-fns';
import { groupBy, keyBy } from 'lodash-es';

import ErrorMessage from '../constants/error-message.js';
import { ACTIVE_STATUS, MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM, PAGE_SIZE } from '../constants/index.js';
import { ResponseCode } from '../constants/response-code.js';
import { USER_ROLE } from '../constants/role.js';
import ClinicScheduleModel from '../models/ClinicScheduleModel.js';
import LeaveScheduleModel from '../models/LeaveScheduleModel.js';
import MedicalConsultationHistoryModel from '../models/MedicalConsultationHistoryModel.js';
import MedicalServiceModel from '../models/MedicalServiceModel.js';
import { DoctorModel } from '../models/UserModel.js';
import { medicalServiceSchema } from '../schemas/medicalService-schema.js';
import { getDateFromISOFormat, removeUndefinedFields } from '../utils/index.js';
import ResponseBuilder from '../utils/response-builder.js';

// [GET] ${PREFIX_API}/medical-service?clinicId=clinicId&type=type&_page=_page&_pageSize=_pageSize&doctorId=doctorId
export const getAllMedicalService = async (req, res) => {
    try {
        const { clinicId, doctorId, type, _page = 1, _pageSize = PAGE_SIZE } = req.query;

        if (doctorId) {
            const checkDoctor = await DoctorModel.findOne({
                _id: doctorId,
                role: USER_ROLE.DOCTOR,
                medicalServiceId: { $ne: null },
            });
            if (!checkDoctor) {
                return new ResponseBuilder()
                    .withCode(ResponseCode.NOT_FOUND)
                    .withMessage('Doctor is not found or does not have a medical service')
                    .build(res);
            }
            const medicalServiceId = checkDoctor.medicalServiceId;
            const medicalService = await MedicalServiceModel.findById(medicalServiceId);

            if (!medicalService) {
                return new ResponseBuilder()
                    .withCode(ResponseCode.NOT_FOUND)
                    .withMessage('Medical service is not found for this doctor')
                    .build(res);
            }

            // If doctorId is provided, we only return the medical service of that doctor
            return new ResponseBuilder()
                .withCode(ResponseCode.SUCCESS)
                .withMessage('Get medical service by doctor success')
                .withData({ items: [medicalService], meta: { total: 1, page: 1 } })
                .build(res);
        }

        const query = {
            ...(clinicId && { clinicId }),
            ...(type && { type: +type }),
        };

        const page = Math.max(1, Number(_page));
        const pageSize = Math.max(1, Number(_pageSize));
        const skip = pageSize * (page - 1);

        const [medicalServices, totalDocuments] = await Promise.all([
            MedicalServiceModel.find(query).skip(skip).limit(pageSize),
            MedicalServiceModel.countDocuments(query),
        ]);

        const medicalServicesIds = medicalServices.map((medicalService) => medicalService._id);
        const doctors = await DoctorModel.find({
            medicalServiceId: { $in: medicalServicesIds },
            role: USER_ROLE.DOCTOR,
        });
        const doctorsByMedicalServiceId = groupBy(doctors, 'medicalServiceId');
        const medicalServicesWithDoctors = medicalServices.map((medicalService) => {
            const doctorsOfMedicalService = doctorsByMedicalServiceId[medicalService._id] || [];
            return {
                ...medicalService.toObject(),
                doctors: doctorsOfMedicalService,
            };
        });

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get all medical services success')
            .withData({
                items: medicalServicesWithDoctors,
                meta: { total: totalDocuments, page },
            })
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

        // Lấy danh sách bác sĩ thuộc dịch vụ y tế
        const allDoctors = await DoctorModel.find({ medicalServiceId });
        const doctorsByMedicalServiceId = groupBy(allDoctors, 'medicalServiceId');
        const medicalServiceWithDoctors = {
            ...checkMedicalService.toObject(),
            doctors: doctorsByMedicalServiceId[medicalServiceId] || [],
        };

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get medical service success')
            .withData(medicalServiceWithDoctors)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [GET] ${PREFIX_API}/medical-service/:id/schedules?date=date&doctorId=doctorId
export const getMedicalServiceSchedules = async (req, res) => {
    try {
        const medicalServiceId = req.params.id;
        const { date, doctorId } = req.query;

        // 1. Validate Medical Service
        const medicalService = await MedicalServiceModel.findById(medicalServiceId);
        if (!medicalService) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Medical service is not found')
                .build(res);
        }

        // 2. Get all clinic schedules for this medical service
        const clinicSchedules = await ClinicScheduleModel.find({ clinicId: medicalService.clinicId }).sort({
            startTime: 1,
        });

        // === CASE 1: Only clinic schedule (no date filter) ===
        if (!date) {
            return new ResponseBuilder()
                .withCode(ResponseCode.SUCCESS)
                .withMessage('Get medical service schedules success')
                .withData(clinicSchedules)
                .build(res);
        }

        // === CASE 2: Schedule of a specific doctor on a date ===
        if (doctorId && date) {
            const doctor = await DoctorModel.findById(doctorId);
            if (!doctor || doctor.medicalServiceId.toString() !== medicalServiceId) {
                return new ResponseBuilder()
                    .withCode(ResponseCode.NOT_FOUND)
                    .withMessage('Doctor is not found or does not belong to this medical service')
                    .build(res);
            }

            const targetDate = getDateFromISOFormat(date);

            const [leaveSchedules, workingSchedules] = await Promise.all([
                LeaveScheduleModel.find({
                    doctorId,
                    date: targetDate,
                    status: ACTIVE_STATUS.ACTIVE,
                }),
                MedicalConsultationHistoryModel.find({
                    clinicId: medicalService.clinicId,
                    examinationDate: {
                        $gte: startOfDay(new Date(date)),
                        $lt: endOfDay(new Date(date)),
                    },
                    status: {
                        $in: [
                            MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM.PENDING,
                            MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM.DONE,
                        ],
                    },
                    responsibilityDoctorId: doctorId,
                }),
            ]);

            const leaveMap = keyBy(leaveSchedules, 'clinicScheduleId');
            const workMap = keyBy(workingSchedules, 'clinicScheduleId');

            const availableSchedules = clinicSchedules.filter((schedule) => {
                const id = schedule._id.toString();
                return !leaveMap[id] && !workMap[id];
            });

            return new ResponseBuilder()
                .withCode(ResponseCode.SUCCESS)
                .withMessage('Get medical service schedules success')
                .withData(availableSchedules)
                .build(res);
        }

        // === CASE 3: Schedule of all doctors in medical service on a date ===
        const doctors = await DoctorModel.find({ medicalServiceId }, { _id: 1 });
        const doctorIds = doctors.map((doc) => doc._id);
        const targetDate = getDateFromISOFormat(date);

        const [leaveSchedules, workingSchedules] = await Promise.all([
            LeaveScheduleModel.find({
                doctorId: { $in: doctorIds },
                date: targetDate,
                status: ACTIVE_STATUS.ACTIVE,
            }),
            MedicalConsultationHistoryModel.find({
                clinicId: medicalService.clinicId,
                clinicScheduleId: { $in: clinicSchedules.map((s) => s._id) },
                examinationDate: date,
                status: {
                    $in: [
                        MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM.PENDING,
                        MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM.DONE,
                    ],
                },
            }),
        ]);

        const leaveGrouped = groupBy(leaveSchedules, 'clinicScheduleId');
        const workGrouped = groupBy(workingSchedules, 'clinicScheduleId');

        const availableSchedules = clinicSchedules.filter((schedule) => {
            const scheduleId = schedule._id;
            const totalDoctors = doctors.length;
            const leaves = leaveGrouped[scheduleId]?.length || 0;
            const works = workGrouped[scheduleId]?.length || 0;
            return totalDoctors - leaves - works > 0;
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
        const { name, originalPrice, currentPrice, type, clinicId, doctorIds, description, symptom, relatedService } =
            req.body;

        const { error } = medicalServiceSchema.validate({ name, currentPrice, type, clinicId });
        const messageError = error?.details[0].message;

        if (messageError) {
            return new ResponseBuilder().withCode(ResponseCode.BAD_REQUEST).withMessage(messageError).build(res);
        }

        const newMedicalService = await MedicalServiceModel.create({
            name,
            originalPrice,
            currentPrice,
            type,
            clinicId,
            description,
            symptom,
            relatedService,
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
        const { name, originalPrice, currentPrice, type, clinicId, doctorIds, description, symptom, relatedService } =
            req.body;

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
            description,
            symptom,
            relatedService,
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

// [PUT] ${PREFIX_API}/medical-service/:id/update-logo
export const updateLogo = async (req, res) => {
    try {
        const file = req.file;
        const medicalServiceId = req.params.id;

        const updatedMedicalService = await MedicalServiceModel.findByIdAndUpdate(
            medicalServiceId,
            {
                $set: {
                    logo: file.path,
                },
            },
            {
                new: true,
            },
        );

        if (!updatedMedicalService) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Medical service is not found')
                .build(res);
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Update avatar success')
            .withData(updatedMedicalService)
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
