import { startOfDay } from 'date-fns';

import ErrorMessage from '../constants/error-message.js';
import { ACTIVE_STATUS, MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM, PAGE_SIZE } from '../constants/index.js';
import { ResponseCode } from '../constants/response-code.js';
import ClinicScheduleModel from '../models/ClinicScheduleModel.js';
import LeaveScheduleModel from '../models/LeaveScheduleModel.js';
import MedicalConsultationHistoryModel from '../models/MedicalConsultationHistoryModel.js';
import { DoctorModel } from '../models/UserModel.js';
import {
    medicalConsultationHistorySchema,
    medicalConsultationHistoryUpdateSchema,
} from '../schemas/medicalConsultationHistory-schema.js';
import { getDateFromISOFormat } from '../utils/index.js';
import ResponseBuilder from '../utils/response-builder.js';

import { createHistoryLog } from './historyLogService.js';

// [GET] ${PREFIX_API}/medical-consultation-history?patientId=patientId
// &clinicId=clinicId
// &status=status
// &responsibilityDoctorId=responsibilityDoctorId
// &patientName=patientName
// &examinationDate=examinationDate
// &clinicScheduleId=clinicScheduleId
// &_page=_page
// &_pageSize=_pageSize
export const getAllMedicalConsultationHistory = async (req, res) => {
    try {
        const {
            patientId,
            clinicId,
            status,
            responsibilityDoctorId,
            patientName,
            examinationDate,
            clinicScheduleId,
            _page = 1,
            _pageSize = PAGE_SIZE,
        } = req.query;
        const query = {
            ...(patientId && { patientId }),
            ...(clinicId && { clinicId }),
            ...(status && { status: +status }),
            ...(responsibilityDoctorId && { responsibilityDoctorId }),
            ...(patientName && { patientName: { $regex: patientName, $options: 'i' } }),
            ...(examinationDate && { examinationDate }),
            ...(clinicScheduleId && { clinicScheduleId }),
        };

        const page = Math.max(1, Number(_page));
        const pageSize = Math.max(1, Number(_pageSize));
        const skip = pageSize * (page - 1);

        const [medicalConsultationHistories, totalDocuments] = await Promise.all([
            MedicalConsultationHistoryModel.find(query)
                .skip(skip)
                .limit(pageSize)
                .populate('clinic')
                .populate('clinicSchedule'),
            MedicalConsultationHistoryModel.countDocuments(query),
        ]);
        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get medical consultation history success')
            .withData({
                items: medicalConsultationHistories,
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

// [GET] ${PREFIX_API}/medical-consultation-history/:id
export const getMedicalConsultationHistoryById = async (req, res) => {
    try {
        const medicalConsultationHistoryId = req.params.id;
        const checkMedicalConsultationHistory = await MedicalConsultationHistoryModel.findOne({
            _id: medicalConsultationHistoryId,
        })
            .populate('clinic')
            .populate('clinicSchedule');

        if (!checkMedicalConsultationHistory) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Medical consultation history is not found')
                .build(res);
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get medical consultation history success')
            .withData(checkMedicalConsultationHistory)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [POST] ${PREFIX_API}/medical-consultation-history
export const createMedicalConsultationHistory = async (req, res) => {
    const userPerformId = req.userId;

    try {
        let {
            responsibilityDoctorId,
            patientId,
            clinicId,
            examinationDate,
            clinicScheduleId,
            examinationReason,
            reExaminateDate,
            medicalServiceId,
            medicalFee,
            medicalServiceName,
            paymentMethod,
            patientName,
            patientGender,
            patientPhoneNumber,
            patientEmail,
            patientDateOfBirth,
            patientProvince,
            patientDistrict,
            patientCommune,
            patientAddress,
        } = req.body;

        const examinationStartOfDay = startOfDay(new Date(examinationDate));

        // Validate cơ bản (không bắt buộc responsibilityDoctorId)
        const baseValidation = {
            patientId,
            clinicId,
            examinationDate: examinationStartOfDay,
            clinicScheduleId,
            examinationReason,
            medicalServiceId,
            medicalFee,
            medicalServiceName,
            paymentMethod,
            patientName,
            patientGender,
            patientPhoneNumber,
            patientEmail,
            patientDateOfBirth,
            patientProvince,
            patientDistrict,
            patientCommune,
            patientAddress,
        };

        const { error } = medicalConsultationHistorySchema.validate(baseValidation);
        if (error) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage(error.details[0].message)
                .build(res);
        }

        // Nếu có responsibilityDoctorId thì mới kiểm tra trùng lịch và kiểm tra slot
        if (responsibilityDoctorId) {
            const [existingConsultation, doctorOnLeave] = await Promise.all([
                MedicalConsultationHistoryModel.findOne({
                    responsibilityDoctorId,
                    clinicId,
                    examinationDate: examinationStartOfDay,
                    clinicScheduleId,
                }),
                LeaveScheduleModel.findOne({
                    doctorId: responsibilityDoctorId,
                    date: getDateFromISOFormat(examinationStartOfDay),
                    status: ACTIVE_STATUS.ACTIVE,
                }),
            ]);

            if (existingConsultation) {
                return new ResponseBuilder()
                    .withCode(ResponseCode.BAD_REQUEST)
                    .withMessage('Medical consultation history already exists')
                    .build(res);
            }

            if (doctorOnLeave) {
                return new ResponseBuilder()
                    .withCode(ResponseCode.BAD_REQUEST)
                    .withMessage('Doctor is on leave')
                    .build(res);
            }

            // Check if at the clinicScheduleId have enough slots
            // B1: Check xem hiện đang có bao nhiêu slot
            // B2: Check xem có bn bác sĩ
            // B2: Check xem có bác sĩ nào nghỉ không
            // B3: Nếu không còn slot thì báo lỗi
            const [slotCount, doctorCount, doctorLeaveCount] = await Promise.all([
                MedicalConsultationHistoryModel.countDocuments({
                    clinicId,
                    clinicScheduleId,
                    examinationDate: examinationStartOfDay,
                }),
                DoctorModel.countDocuments({ clinicId }),
                LeaveScheduleModel.countDocuments({
                    doctorId: responsibilityDoctorId,
                    date: getDateFromISOFormat(examinationStartOfDay),
                    status: ACTIVE_STATUS.ACTIVE,
                }),
            ]);

            const availableSlots = doctorCount - doctorLeaveCount - slotCount;
            if (availableSlots <= 0) {
                return new ResponseBuilder()
                    .withCode(ResponseCode.BAD_REQUEST)
                    .withMessage('This schedule is full, please choose another schedule')
                    .build(res);
            }
        }

        // Kiểm tra lịch sử khám đã tồn tại chưa
        const existingHistory = await MedicalConsultationHistoryModel.findOne({
            patientId,
            clinicId,
            examinationDate: examinationStartOfDay,
            clinicScheduleId,
        });

        if (existingHistory) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Medical consultation history already exists')
                .build(res);
        }

        // Kiểm tra xem bệnh nhân có đang khám ở phòng khám khác và cùng khung giờ không
        const [conflictHistory, clinicSchedule] = await Promise.all([
            MedicalConsultationHistoryModel.findOne({
                patientId,
                clinicId: { $ne: clinicId },
                examinationDate: examinationStartOfDay,
            }).populate('clinicSchedule'),
            ClinicScheduleModel.findById(clinicScheduleId),
        ]);

        const isConflict =
            conflictHistory?.clinicSchedule?.startTime === clinicSchedule?.startTime ||
            conflictHistory?.clinicSchedule?.endTime === clinicSchedule?.endTime;

        if (conflictHistory && isConflict) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Patient is already in another clinic at the same time')
                .withData(isConflict)
                .build(res);
        }

        // Nếu như không có id bác sĩ gửi lên thì lấy tất cả các bác sĩ available trong dịch vụ và assign ngẫu nhiên
        // B1: lấy tất cả các bác sĩ trong phòng khám và dịch vụ
        // B2: Lọc ra các bác sĩ có lịch khám trong ngày và ca đó
        // B3: Lọc ra các bác sĩ có lịch nghỉ trong ngày và ca đó
        if (!responsibilityDoctorId) {
            const [doctors, scheduledDoctors, onLeaveDoctors] = await Promise.all([
                DoctorModel.find({ clinicId, medicalServiceId }),
                MedicalConsultationHistoryModel.find({
                    clinicId,
                    medicalServiceId,
                    examinationDate: examinationStartOfDay,
                    clinicScheduleId,
                }),
                LeaveScheduleModel.find({
                    clinicId,
                    date: getDateFromISOFormat(examinationStartOfDay),
                    status: ACTIVE_STATUS.ACTIVE,
                }),
            ]);

            const scheduledDoctorIds = scheduledDoctors.map((d) => d.responsibilityDoctorId.toString());
            const onLeaveDoctorIds = onLeaveDoctors.map((d) => d.doctorId.toString());

            const availableDoctors = doctors.filter(
                (d) => !scheduledDoctorIds.includes(d._id.toString()) && !onLeaveDoctorIds.includes(d._id.toString()),
            );

            if (availableDoctors.length === 0) {
                return new ResponseBuilder()
                    .withCode(ResponseCode.BAD_REQUEST)
                    .withMessage('No available doctors')
                    .build(res);
            }

            const randomDoctor = availableDoctors[Math.floor(Math.random() * availableDoctors.length)];
            responsibilityDoctorId = randomDoctor._id;
        }

        // Tạo lịch khám
        const newHistory = new MedicalConsultationHistoryModel({
            responsibilityDoctorId,
            patientId,
            clinicId,
            examinationDate: examinationStartOfDay,
            clinicScheduleId,
            examinationReason,
            reExaminateDate,
            medicalServiceId,
            medicalFee,
            medicalServiceName,
            paymentMethod,
            patientName,
            patientGender,
            patientPhoneNumber,
            patientEmail,
            patientDateOfBirth,
            patientProvince,
            patientDistrict,
            patientCommune,
            patientAddress,
        });

        await newHistory.save();

        await createHistoryLog(
            patientId,
            'CREATE',
            `Create medical consultation history`,
            userPerformId,
            'medical-consultation-history',
            newHistory._id,
        );

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Create medical consultation history success')
            .withData(newHistory)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [PUT] ${PREFIX_API}/medical-consultation-history/:id
export const updateMedicalConsultationHistory = async (req, res) => {
    try {
        const medicalConsultationHistoryId = req.params.id;
        const {
            patientId,
            clinicId,
            responsibilityDoctorId,
            examinationDate,
            clinicScheduleId,
            examinationReason,
            patientStatus,
            diagnosis,
            reExaminateDate,
            noteFromDoctor,
            medicalFee,
            medicalServiceName,
            paymentMethod,
            paymentStatus,
            patientName,
            patientGender,
            patientPhoneNumber,
            patientEmail,
            patientDateOfBirth,
            patientProvince,
            patientDistrict,
            patientAddress,
        } = req.body;

        const examinationStartOfDay = startOfDay(new Date(examinationDate));

        const { error } = medicalConsultationHistoryUpdateSchema.validate({
            patientId,
            clinicId,
            examinationDate: examinationStartOfDay,
            clinicScheduleId,
            examinationReason,
            medicalFee,
            medicalServiceName,
            paymentMethod,
            patientName,
            patientGender,
            patientPhoneNumber,
            patientEmail,
            patientDateOfBirth,
            patientProvince,
            patientDistrict,
            patientAddress,
        });
        const messageError = error?.details[0].message;

        if (messageError) {
            return new ResponseBuilder().withCode(ResponseCode.BAD_REQUEST).withMessage(messageError).build(res);
        }

        // Check xem lịch khám đã tồn tại chưa
        // Check xem bác sĩ có lịch nghỉ không
        // Check xem bác sĩ có lịch khám không
        const [checkMedicalConsultationHistory, checkLeaveScheduleOfDoctor, checkExistConsultationHistoryOfDoctor] =
            await Promise.all([
                MedicalConsultationHistoryModel.findOne({
                    _id: medicalConsultationHistoryId,
                }),
                LeaveScheduleModel.findOne({
                    doctorId: responsibilityDoctorId,
                    date: getDateFromISOFormat(examinationStartOfDay),
                    status: ACTIVE_STATUS.ACTIVE,
                }),
                MedicalConsultationHistoryModel.findOne({
                    responsibilityDoctorId,
                    clinicId,
                    examinationStartOfDay,
                    clinicScheduleId,
                }),
            ]);

        if (!checkMedicalConsultationHistory) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Medical consultation history is not found')
                .build(res);
        }

        if (
            [
                MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM.CANCELED || MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM.DONE,
            ].includes(checkMedicalConsultationHistory.status)
        ) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Only pending medical consultation history can be updated')
                .build(res);
        }

        if (checkLeaveScheduleOfDoctor) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Doctor is on leave')
                .build(res);
        }

        if (checkExistConsultationHistoryOfDoctor) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Doctor already has a schedule at this time')
                .build(res);
        }

        const response = await MedicalConsultationHistoryModel.findOneAndUpdate(
            { _id: medicalConsultationHistoryId },
            {
                patientId,
                clinicId,
                responsibilityDoctorId,
                examinationStartOfDay,
                clinicScheduleId,
                examinationReason,
                patientStatus,
                diagnosis,
                reExaminateDate,
                noteFromDoctor,
                medicalFee,
                medicalServiceName,
                paymentMethod,
                paymentStatus,
                patientName,
                patientGender,
                patientPhoneNumber,
                patientEmail,
                patientDateOfBirth,
                patientProvince,
                patientDistrict,
                patientAddress,
            },
            {
                new: true,
            },
        );

        await createHistoryLog(
            patientId,
            'UPDATE',
            `Update medical consultation history`,
            req.userId,
            'medical-consultation-history',
            response._id,
        );

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Update medical consultation history success')
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

// [PUT] ${PREFIX_API}/medical-consultation-history/:id/cancel
export const cancelMedicalConsultationHistory = async (req, res) => {
    try {
        const medicalConsultationHistoryId = req.params.id;
        const checkMedicalConsultationHistory = await MedicalConsultationHistoryModel.findOne({
            _id: medicalConsultationHistoryId,
        });

        if (!checkMedicalConsultationHistory) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Medical consultation history is not found')
                .build(res);
        }

        if (
            [MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM.CANCELED, MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM.DONE].includes(
                checkMedicalConsultationHistory.status,
            )
        ) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Only pending medical consultation history can be canceled')
                .build(res);
        }

        const response = await MedicalConsultationHistoryModel.findOneAndUpdate(
            { _id: medicalConsultationHistoryId },
            { status: MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM.CANCELED },
            {
                new: true,
            },
        );

        await createHistoryLog(
            response.patientId,
            'UPDATE',
            `Cancel medical consultation history`,
            req.userId,
            'medical-consultation-history',
            response._id,
        );

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Cancel medical consultation history success')
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

// [PUT] ${PREFIX_API}/medical-consultation-history/:id/complete
export const completeMedicalConsultationHistory = async (req, res) => {
    try {
        const medicalConsultationHistoryId = req.params.id;
        const {
            patientId,
            clinicId,
            responsibilityDoctorId,
            examinationDate,
            clinicScheduleId,
            examinationReason,
            patientStatus,
            diagnosis,
            reExaminateDate,
            noteFromDoctor,
            medicalFee,
            medicalServiceName,
            paymentMethod,
            paymentStatus,
            patientName,
            patientGender,
            patientPhoneNumber,
            patientEmail,
            patientDateOfBirth,
            patientProvince,
            patientDistrict,
            patientAddress,
        } = req.body;

        const examinationStartOfDay = startOfDay(new Date(examinationDate));

        const { error } = medicalConsultationHistoryUpdateSchema.validate({
            patientId,
            clinicId,
            examinationDate: examinationStartOfDay,
            clinicScheduleId,
            examinationReason,
            medicalFee,
            medicalServiceName,
            paymentMethod,
            patientName,
            patientGender,
            patientPhoneNumber,
            patientEmail,
            patientDateOfBirth,
            patientProvince,
            patientDistrict,
            patientAddress,
            responsibilityDoctorId,
            patientStatus,
            diagnosis,
            reExaminateDate,
        });
        const messageError = error?.details[0].message;

        if (messageError) {
            return new ResponseBuilder().withCode(ResponseCode.BAD_REQUEST).withMessage(messageError).build(res);
        }

        // Check xem lịch khám đã tồn tại chưa
        // Check xem bác sĩ có lịch nghỉ không
        // Check xem bác sĩ có lịch khám không
        const [checkMedicalConsultationHistory, checkLeaveScheduleOfDoctor, checkExistConsultationHistoryOfDoctor] =
            await Promise.all([
                MedicalConsultationHistoryModel.findOne({
                    _id: medicalConsultationHistoryId,
                }),
                LeaveScheduleModel.findOne({
                    doctorId: responsibilityDoctorId,
                    date: getDateFromISOFormat(examinationStartOfDay),
                    status: ACTIVE_STATUS.ACTIVE,
                }),
                MedicalConsultationHistoryModel.findOne({
                    responsibilityDoctorId,
                    clinicId,
                    examinationStartOfDay,
                    clinicScheduleId,
                }),
            ]);

        if (!checkMedicalConsultationHistory) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Medical consultation history is not found')
                .build(res);
        }

        if (
            [MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM.CANCELED, MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM.DONE].includes(
                checkMedicalConsultationHistory.status,
            )
        ) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Only pending medical consultation history can be completed')
                .build(res);
        }

        if (checkLeaveScheduleOfDoctor) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Doctor is on leave')
                .build(res);
        }

        if (checkExistConsultationHistoryOfDoctor) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Doctor already has a schedule at this time')
                .build(res);
        }

        const response = await MedicalConsultationHistoryModel.findOneAndUpdate(
            { _id: medicalConsultationHistoryId },
            {
                status: MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM.DONE,
                patientId,
                clinicId,
                responsibilityDoctorId,
                examinationStartOfDay,
                clinicScheduleId,
                examinationReason,
                patientStatus,
                diagnosis,
                reExaminateDate,
                noteFromDoctor,
                medicalFee,
                medicalServiceName,
                paymentMethod,
                paymentStatus,
                patientName,
                patientGender,
                patientPhoneNumber,
                patientEmail,
                patientDateOfBirth,
                patientProvince,
                patientDistrict,
                patientAddress,
            },
            {
                new: true,
            },
        );

        await createHistoryLog(
            response.patientId,
            'UPDATE',
            `Complete medical consultation history`,
            req.userId,
            'medical-consultation-history',
            response._id,
        );

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Complete medical consultation history success')
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

// [DELETE] ${PREFIX_API}/medical-consultation-history/:id
export const deleteMedicalConsultationHistory = async (req, res) => {
    try {
        const medicalConsultationHistoryId = req.params.id;
        const checkMedicalConsultationHistory = await MedicalConsultationHistoryModel.findOne({
            _id: medicalConsultationHistoryId,
        });

        if (!checkMedicalConsultationHistory) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Medical consultation history is not found')
                .build(res);
        }

        await MedicalConsultationHistoryModel.deleteOne({ _id: medicalConsultationHistoryId });

        await createHistoryLog(
            checkMedicalConsultationHistory.patientId,
            'DELETE',
            `Delete medical consultation history`,
            req.userId,
            'medical-consultation-history',
            medicalConsultationHistoryId,
        );

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Delete medical consultation history success')
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
