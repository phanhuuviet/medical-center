import Joi from 'joi';

export const doctorSchema = Joi.object({
    userName: Joi.string().required().messages({
        'string.empty': 'UserName is not allowed to be empty',
        'any.required': 'UserName is required',
    }),
    email: Joi.string().required().messages({
        'string.empty': 'Email is not allowed to be empty',
        'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password is not allowed to be empty',
        'any.required': 'Password is required',
    }),
    dateOfBirth: Joi.date().required().messages({
        'date.empty': 'DateOfBirth is not allowed to be empty',
        'any.required': 'DateOfBirth is required',
    }),
    gender: Joi.number().required().messages({
        'number.empty': 'Gender is not allowed to be empty',
        'any.required': 'gender is required',
    }),
    province: Joi.string().required().messages({
        'string.empty': 'Province is not allowed to be empty',
        'any.required': 'Province is required',
    }),
    district: Joi.string().required().messages({
        'string.empty': 'District is not allowed to be empty',
        'any.required': 'District is required',
    }),
    commune: Joi.string().required().messages({
        'string.empty': 'Commune is not allowed to be empty',
        'any.required': 'Commune is required',
    }),
    clinicId: Joi.string().required().messages({
        'string.base': 'clinicId must be a string',
        'string.empty': 'clinicId is not allowed to be empty',
        'any.required': 'clinicId is required',
    }),
    specialty: Joi.string().required().messages({
        'string.empty': 'Specialty is not allowed to be empty',
        'any.required': 'Specialty is required',
    }),
    qualification: Joi.string().required().messages({
        'string.empty': 'Qualification is not allowed to be empty',
        'any.required': 'Qualification is required',
    }),
});
