import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import * as authService from '../services/authService.js';
import ResponseBuilder from '../utils/response-builder.js';

export const signIn = async (req, res, next) => {
    try {
        return await authService.signIn(req, res, next);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const signUp = async (req, res, next) => {
    try {
        return await authService.signUp(req, res, next);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
