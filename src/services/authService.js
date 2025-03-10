import bcrypt from 'bcryptjs';
import { isNil } from 'lodash-es';

import ErrorMessage from '../constants/error-message.js';
import { SALT_ROUNDS } from '../constants/index.js';
import { ResponseCode } from '../constants/response-code.js';
import UserModel from '../models/UserModel.js';
import { signInSchema, signUpSchema } from '../schemas/auth-schema.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generate-jwt.js';
import ResponseBuilder from '../utils/response-builder.js';
import { checkEmail } from '../utils/validate.js';

import * as healthRecordService from './healthRecordService.js';

// [POST] ${PREFIX_API}/auth/sign-in
export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { error } = signInSchema.validate({ email, password });
        const messageError = error?.details[0].message;

        if (messageError) {
            return new ResponseBuilder().withCode(ResponseCode.BAD_REQUEST).withMessage(messageError).build(res);
        } else if (!checkEmail(email)) {
            return new ResponseBuilder().withCode(ResponseCode.BAD_REQUEST).withMessage('Email is invalid').build(res);
        }

        const checkUser = await UserModel.findOne({ email });

        // Check exist email in DB
        if (isNil(checkUser)) {
            return new ResponseBuilder().withCode(ResponseCode.NOT_FOUND).withMessage('Email is not found').build(res);
        }

        // Check password vs password in DB
        const comparePassword = bcrypt.compareSync(password, checkUser.password);

        if (!comparePassword) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Password is incorrect')
                .build(res);
        }

        // generate access token vs refresh token
        const access_token = generateAccessToken({
            id: checkUser._id,
            role: checkUser.role,
        });

        const refresh_token = generateRefreshToken({
            id: checkUser._id,
            role: checkUser.role,
        });

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Sign in success')
            .withData({
                id: checkUser._id,
                access_token,
                refresh_token,
            })
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [POST] ${PREFIX_API}/auth/sign-up
export const signUp = async (req, res) => {
    try {
        const { userName, email, password, dateOfBirth, gender, province, district, address } = req.body;

        const { error } = signUpSchema.validate({
            userName,
            email,
            password,
            dateOfBirth,
            gender,
            province,
            district,
        });
        const messageError = error?.details[0].message;

        // Check required fields
        if (messageError) {
            return new ResponseBuilder().withCode(ResponseCode.BAD_REQUEST).withMessage(messageError).build(res);
        } else if (!checkEmail(email)) {
            return new ResponseBuilder().withCode(ResponseCode.BAD_REQUEST).withMessage('Email is invalid').build(res);
        }

        const checkUser = await UserModel.findOne({ email });
        if (!isNil(checkUser)) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Email is already taken')
                .build(res);
        }

        const hashPassword = bcrypt.hashSync(password, SALT_ROUNDS);

        const newUser = await UserModel.create({
            userName,
            email,
            password: hashPassword,
            dateOfBirth,
            gender,
            province,
            district,
            address,
        });

        // Create health record for new user
        await healthRecordService.createHealthRecord({ userId: newUser._id });

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Sign up success')
            .withData(newUser)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
