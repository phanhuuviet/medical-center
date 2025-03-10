import Joi from 'joi';

export const medicalServiceSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.empty': 'Name is not allowed to be empty',
        'any.required': 'Name is required',
    }),
    currentPrice: Joi.number().required().messages({
        'number.empty': 'CurrentPrice is not allowed to be empty',
        'any.required': 'CurrentPrice is required',
    }),
    type: Joi.number().required().messages({
        'number.base': 'Type must be a number',
        'number.empty': 'Type is not allowed to be empty',
        'any.required': 'Type is required',
    }),
    clinicId: Joi.string().required().messages({
        'string.empty': 'ClinicId is not allowed to be empty',
        'any.required': 'ClinicId is required',
    }),
});
