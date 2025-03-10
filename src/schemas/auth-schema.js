import Joi from 'joi';

export const signInSchema = Joi.object({
    email: Joi.string().required().messages({
        'string.empty': 'Email is not allowed to be empty',
        'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password is not allowed to be empty',
        'any.required': 'Password is required',
    }),
});

export const signUpSchema = Joi.object({
    userName: Joi.string().required().messages({
        'string.empty': 'User name is not allowed to be empty',
        'any.required': 'User name is required',
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
        'date.empty': 'Date of birth is not allowed to be empty',
        'any.required': 'Date of birth is required',
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
});
