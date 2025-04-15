import Joi from 'joi';

export const dashboardSchema = Joi.object({
    year: Joi.number().messages({
        'number.base': 'Year must be a number',
    }),
    month: Joi.number().messages({
        'number.base': 'Month must be a number',
    }),
    clinicId: Joi.string().messages({
        'string.base': 'Clinic ID must be a string',
    }),
}).when(Joi.object({ month: Joi.exist() }).unknown(), {
    then: Joi.object({
        year: Joi.required().messages({
            'any.required': 'Year is required',
        }),
    }),
});
