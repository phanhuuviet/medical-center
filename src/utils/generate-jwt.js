import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';

dotenv.config();

export const generateAccessToken = (payload) => {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.EXPIRES_ACCESS_TOKEN,
    });

    return accessToken;
};

export const generateRefreshToken = (payload) => {
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.EXPIRES_REFRESH_TOKEN,
    });

    return refreshToken;
};

export const refreshToken = (token) => {
    try {
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, function (err, data) {
            if (err) {
                return {
                    statusCode: ResponseCode.UNAUTHORIZED,
                    message: ErrorMessage.UNAUTHORIZED,
                };
            }
            const access_token = generateAccessToken({
                id: data?.id,
                role: data?.role,
            });
            return {
                statusCode: ResponseCode.SUCCESS,
                message: ErrorMessage.SUCCESS,
                data: {
                    access_token,
                },
            };
        });
    } catch (err) {
        console.log(err);
        return {
            statusCode: ResponseCode.INTERNAL_SERVER_ERROR,
            message: ErrorMessage.INTERNAL_SERVER_ERROR,
        };
    }
};
