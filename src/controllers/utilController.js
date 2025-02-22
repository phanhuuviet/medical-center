import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import * as utilService from '../services/utilService.js';
import ResponseBuilder from '../utils/response-builder.js';

export const uploadImage = async (req, res, next) => {
    try {
        return await utilService.uploadImage(req, res, next);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
