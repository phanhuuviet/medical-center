import Joi from 'joi';

export const medicalConsultationHistorySchema = Joi.object({
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
    patientAddress: Joi.string().required().messages({
        'string.empty': 'Patient address is not allowed to be empty',
        'any.required': 'Patient address is required',
    }),
});
