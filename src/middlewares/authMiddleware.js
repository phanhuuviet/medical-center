import jwt from 'jsonwebtoken';

import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import ResponseBuilder from '../utils/response-builder.js';

export const authenticateToken = (req, res, next) => {
    try {
        const token = req.headers?.authorization.split(' ')[1];
        if (!token) {
            return new ResponseBuilder()
                .withCode(ResponseCode.UNAUTHORIZED)
                .withMessage(ErrorMessage.UNAUTHORIZED)
                .build(res);
        }

        // Verify token
        const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.userId = data.id;
        next();
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.UNAUTHORIZED)
            .withMessage(ErrorMessage.UNAUTHORIZED)
            .build(res);
    }
};
