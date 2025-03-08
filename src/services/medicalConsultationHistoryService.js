import ErrorMessage from '../constants/error-message.js';
import { MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM } from '../constants/index.js';
import { ResponseCode } from '../constants/response-code.js';
import MedicalConsultationHistoryModel from '../models/MedicalConsultationHistoryModel.js';
import ResponseBuilder from '../utils/response-builder.js';
import { checkFieldRequire } from '../utils/validate.js';

// [GET] ${PREFIX_API}/medical-consultation-history
export const getAllMedicalConsultationHistory = async (req, res) => {
    try {
        const medicalConsultationHistories = await MedicalConsultationHistoryModel.find();
        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get medical consultation history success')
            .withData(medicalConsultationHistories)
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
        });

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
    try {
        const {
            patientId,
            clinicId,
            examinationDate,
            clinicScheduleId,
            examinationReason,
            reExaminateDate,
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
        } = req.body;
        if (
            !checkFieldRequire(
                patientId,
                clinicId,
                examinationDate,
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
            )
        ) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage(ErrorMessage.MISSING_REQUIRED_FIELDS)
                .build(res);
        }

        const medicalConsultationHistory = new MedicalConsultationHistoryModel({
            patientId,
            clinicId,
            examinationDate,
            clinicScheduleId,
            examinationReason,
            reExaminateDate,
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

        await medicalConsultationHistory.save();
        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Create medical consultation history success')
            .withData(medicalConsultationHistory)
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
        // if (
        //     !checkFieldRequire(
        //         patientId,
        //         clinicId,
        //         examinationDate,
        //         clinicScheduleId,
        //         examinationReason,
        //         medicalFee,
        //         medicalServiceName,
        //         paymentMethod,
        //         patientName,
        //         patientGender,
        //         patientPhoneNumber,
        //         patientEmail,
        //         patientDateOfBirth,
        //         patientProvince,
        //         patientDistrict,
        //         patientAddress,
        //     )
        // ) {
        //     return new ResponseBuilder()
        //         .withCode(ResponseCode.BAD_REQUEST)
        //         .withMessage(ErrorMessage.MISSING_REQUIRED_FIELDS)
        //         .build(res);
        // }

        const checkMedicalConsultationHistory = await MedicalConsultationHistoryModel.findOne({
            _id: medicalConsultationHistoryId,
        });
        if (!checkMedicalConsultationHistory) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Medical consultation history is not found')
                .build(res);
        }

        const response = await MedicalConsultationHistoryModel.findOneAndUpdate(
            { _id: medicalConsultationHistoryId },
            {
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
            },
            {
                new: true,
            },
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

        const response = await MedicalConsultationHistoryModel.findOneAndUpdate(
            { _id: medicalConsultationHistoryId },
            { status: MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM.CANCEL },
            {
                new: true,
            },
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
        const checkMedicalConsultationHistory = await MedicalConsultationHistoryModel.findOne({
            _id: medicalConsultationHistoryId,
        });

        if (!checkMedicalConsultationHistory) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Medical consultation history is not found')
                .build(res);
        }

        const response = await MedicalConsultationHistoryModel.findOneAndUpdate(
            { _id: medicalConsultationHistoryId },
            { status: MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM.DONE },
            {
                new: true,
            },
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
