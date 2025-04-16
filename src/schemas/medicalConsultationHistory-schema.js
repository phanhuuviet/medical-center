import Joi from 'joi';

export const medicalConsultationHistorySchema = Joi.object({
    responsibilityDoctorId: Joi.string().required().messages({
        'string.base': 'responsibilityDoctorId must be a string',
        'string.empty': 'responsibilityDoctorId is not allowed to be empty',
        'any.required': 'responsibilityDoctorId is required',
    }),
    patientId: Joi.string().required().messages({
        'string.base': 'patientId must be a string',
        'string.empty': 'patientId is not allowed to be empty',
        'any.required': 'patientId is required',
    }),
    clinicId: Joi.string().required().messages({
        'string.base': 'clinicId must be a string',
        'string.empty': 'clinicId is not allowed to be empty',
        'any.required': 'clinicId is required',
    }),
    examinationDate: Joi.date().required().messages({
        'date.empty': 'Examination date is not allowed to be empty',
        'any.required': 'Examination date is required',
    }),
    clinicScheduleId: Joi.string().required().messages({
        'string.base': 'clinicScheduleId must be a string',
        'string.empty': 'clinicScheduleId is not allowed to be empty',
        'any.required': 'clinicScheduleId is required',
    }),
    examinationReason: Joi.string().required().messages({
        'string.empty': 'Examination reason is not allowed to be empty',
        'any.required': 'Examination reason is required',
    }),
    medicalFee: Joi.number().required().messages({
        'number.base': 'Medical fee must be a number',
        'number.empty': 'Medical fee is not allowed to be empty',
        'any.required': 'Medical fee is required',
    }),
    medicalServiceName: Joi.string().required().messages({
        'string.empty': 'Medical service name is not allowed to be empty',
        'any.required': 'Medical service name is required',
    }),
    paymentMethod: Joi.number().required().messages({
        'number.base': 'Payment method must be a number',
        'number.empty': 'Payment method is not allowed to be empty',
        'any.required': 'Payment method is required',
    }),
    patientName: Joi.string().required().messages({
        'string.empty': 'Patient name is not allowed to be empty',
        'any.required': 'Patient name is required',
    }),
    patientGender: Joi.number().required().messages({
        'number.base': 'Patient gender must be a number',
        'number.empty': 'Patient gender is not allowed to be empty',
        'any.required': 'Patient gender is required',
    }),
    patientPhoneNumber: Joi.string().required().messages({
        'string.empty': 'Patient phone number is not allowed to be empty',
        'any.required': 'Patient phone number is required',
    }),
    patientEmail: Joi.string().required().messages({
        'string.empty': 'Patient email is not allowed to be empty',
        'any.required': 'Patient email is required',
    }),
    patientDateOfBirth: Joi.date().required().messages({
        'date.empty': 'Patient date of birth is not allowed to be empty',
        'any.required': 'Patient date of birth is required',
    }),
    patientProvince: Joi.string().required().messages({
        'string.empty': 'Patient province is not allowed to be empty',
        'any.required': 'Patient province is required',
    }),
    patientDistrict: Joi.string().required().messages({
        'string.empty': 'Patient district is not allowed to be empty',
        'any.required': 'Patient district is required',
    }),
    patientCommune: Joi.string().required().messages({
        'string.empty': 'Patient commune is not allowed to be empty',
        'any.required': 'Patient commune is required',
    }),
    patientAddress: Joi.string().required().messages({
        'string.empty': 'Patient address is not allowed to be empty',
        'any.required': 'Patient address is required',
    }),
});

export const medicalConsultationHistoryUpdateSchema = Joi.object({
    patientId: Joi.string().messages({
        'string.base': 'patientId must be a string',
        'string.empty': 'patientId is not allowed to be empty',
    }),
    clinicId: Joi.string().messages({
        'string.base': 'clinicId must be a string',
        'string.empty': 'clinicId is not allowed to be empty',
    }),
    examinationDate: Joi.date().messages({
        'date.empty': 'Examination date is not allowed to be empty',
    }),
    clinicScheduleId: Joi.string().messages({
        'string.base': 'clinicScheduleId must be a string',
        'string.empty': 'clinicScheduleId is not allowed to be empty',
    }),
    examinationReason: Joi.string().messages({
        'string.empty': 'Examination reason is not allowed to be empty',
    }),
    medicalFee: Joi.number().messages({
        'number.base': 'Medical fee must be a number',
        'number.empty': 'Medical fee is not allowed to be empty',
    }),
    medicalServiceName: Joi.string().messages({
        'string.empty': 'Medical service name is not allowed to be empty',
    }),
    paymentMethod: Joi.number().messages({
        'number.base': 'Payment method must be a number',
        'number.empty': 'Payment method is not allowed to be empty',
    }),
    patientName: Joi.string().messages({
        'string.empty': 'Patient name is not allowed to be empty',
    }),
    patientGender: Joi.number().messages({
        'number.base': 'Patient gender must be a number',
        'number.empty': 'Patient gender is not allowed to be empty',
    }),
    patientPhoneNumber: Joi.string().messages({
        'string.empty': 'Patient phone number is not allowed to be empty',
    }),
    patientEmail: Joi.string().messages({
        'string.empty': 'Patient email is not allowed to be empty',
    }),
    patientDateOfBirth: Joi.date().messages({
        'date.empty': 'Patient date of birth is not allowed to be empty',
    }),
    patientProvince: Joi.string().messages({
        'string.empty': 'Patient province is not allowed to be empty',
    }),
    patientDistrict: Joi.string().messages({
        'string.empty': 'Patient district is not allowed to be empty',
    }),
    patientAddress: Joi.string().messages({
        'string.empty': 'Patient address is not allowed to be empty',
    }),
    responsibilityDoctorId: Joi.string().messages({
        'string.base': 'Responsibility doctor ID must be a string',
        'string.empty': 'Responsibility doctor ID is not allowed to be empty',
        'any.required': 'Responsibility doctor ID is required',
    }),
    patientStatus: Joi.string().messages({
        'string.base': 'Patient status must be a string',
        'string.empty': 'Patient status is not allowed to be empty',
        'any.required': 'Patient status is required',
    }),
    diagnosis: Joi.string().messages({
        'string.base': 'Diagnosis must be a string',
        'string.empty': 'Diagnosis is not allowed to be empty',
        'any.required': 'Diagnosis is required',
    }),
    reExaminateDate: Joi.date().messages({
        'date.empty': 'Re-examination date is not allowed to be empty',
        'any.required': 'Re-examination date is required',
    }),
});
