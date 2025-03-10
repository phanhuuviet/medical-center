import Joi from 'joi';

export const leaveScheduleSchema = Joi.object({
    doctorId: Joi.string().required().messages({
        'string.base': 'doctorId must be a string',
        'string.empty': 'doctorId is not allowed to be empty',
        'any.required': 'doctorId is required',
    }),
    clinicScheduleId: Joi.string().required().messages({
        'string.base': 'clinicScheduleId must be a string',
        'string.empty': 'clinicScheduleId is not allowed to be empty',
        'any.required': 'clinicScheduleId is required',
    }),
    date: Joi.date().required().messages({
        'date.empty': 'Date is not allowed to be empty',
        'any.required': 'Date is required',
    }),
});
