import { isNil } from 'lodash-es';

import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import UserModel from '../models/UserModel.js';
import ResponseBuilder from '../utils/response-builder.js';

export const getMe = async (req, res) => {
    try {
        console.log('userId', req.userId);
        const userId = req.userId;
        const checkUser = await UserModel.findOne({ _id: userId });

        if (isNil(checkUser)) {
            return new ResponseBuilder().withCode(ResponseCode.NOT_FOUND).withMessage('User is not found').build(res);
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get user success')
            .withData(checkUser)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR);
    }
};
