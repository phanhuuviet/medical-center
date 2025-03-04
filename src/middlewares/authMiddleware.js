import jwt from 'jsonwebtoken';

import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import { USER_ROLE } from '../constants/role.js';
import ResponseBuilder from '../utils/response-builder.js';

// Using for api by self user
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
        req.role = data.role;
        next();
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.UNAUTHORIZED)
            .withMessage(ErrorMessage.UNAUTHORIZED)
            .build(res);
    }
};

// Using for api by admin
export const authenticateAdmin = (req, res, next) => {
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
        if (data.role !== USER_ROLE.ADMIN) {
            return new ResponseBuilder()
                .withCode(ResponseCode.FORBIDDEN)
                .withMessage(ErrorMessage.FORBIDDEN)
                .build(res);
        }

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

// Using for api by self user or admin
export const authenticateSelfUserOrAdminMiddleware = (req, res, next) => {
    try {
        const token = req.headers?.authorization.split(' ')[1];
        const idUser =
            req.params.doctorId ||
            req.params.userId ||
            req.params.id ||
            req.body.userId ||
            req.body.id ||
            req.body.doctorId;

        const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (data.role === USER_ROLE.ADMIN || data.id === idUser) {
            next();
        } else {
            return new ResponseBuilder()
                .withCode(ResponseCode.FORBIDDEN)
                .withMessage(ErrorMessage.FORBIDDEN)
                .build(res);
        }
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.UNAUTHORIZED)
            .withMessage(ErrorMessage.UNAUTHORIZED)
            .build(res);
    }
};
