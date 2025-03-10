import Joi from 'joi';

export const clinicScheduleSchema = Joi.object({
    clinicId: Joi.string().required().messages({
        'string.base': 'clinicId must be a string',
        'string.empty': 'clinicId is not allowed to be empty',
        'any.required': 'clinicId is required',
    }),
    startTime: Joi.string().required().messages({
        'string.base': 'startTime must be a string',
        'string.empty': 'startTime is not allowed to be empty',
        'any.required': 'startTime is required',
    }),
    endTime: Joi.string().required().messages({
        'string.base': 'endTime must be a string',
        'string.empty': 'endTime is not allowed to be empty',
        'any.required': 'endTime is required',
    }),
});
