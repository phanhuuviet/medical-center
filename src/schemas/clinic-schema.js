import Joi from 'joi';

export const clinicSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.empty': 'Name is not allowed to be empty',
        'any.required': 'Name is required',
    }),
    address: Joi.string().required().messages({
        'string.empty': 'Address is not allowed to be empty',
        'any.required': 'Address is required',
    }),
    email: Joi.string().required().messages({
        'string.empty': 'Email is not allowed to be empty',
        'any.required': 'Email is required',
    }),
    hotline: Joi.string().required().messages({
        'string.empty': 'Hotline is not allowed to be empty',
        'any.required': 'Hotline is required',
    }),
});
