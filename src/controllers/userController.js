import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import * as userService from '../services/userService.js';
import ResponseBuilder from '../utils/response-builder.js';

export const getMe = async (req, res, next) => {
    try {
        return await userService.getMe(req, res, next);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        return await userService.getUserById(req, res, next);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        return await userService.updateUser(req, res, next);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const updateAvatar = async (req, res, next) => {
    try {
        return await userService.updateAvatar(req, res, next);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        return await userService.deleteUser(req, res, next);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
