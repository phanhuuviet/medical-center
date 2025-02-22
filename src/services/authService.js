import bcrypt from 'bcryptjs';
import { isNil } from 'lodash-es';

import ErrorMessage from '../constants/error-message.js';
import { SALT_ROUNDS } from '../constants/index.js';
import { ResponseCode } from '../constants/response-code.js';
import UserModel from '../models/UserModel.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generate-jwt.js';
import ResponseBuilder from '../utils/response-builder.js';
import { checkEmail } from '../utils/validate.js';

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('email', email);

        if (!email || !password) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Email and password are required')
                .build(res);
        } else if (!checkEmail(email)) {
            return new ResponseBuilder().withCode(ResponseCode.BAD_REQUEST).withMessage('Email is invalid').build(res);
        }

        const checkUser = await UserModel.findOne({ email });
        console.log('checkUser', checkUser);

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
                access_token,
                refresh_token,
            })
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR);
    }
};

export const signUp = async (req, res) => {
    try {
        const { userName, email, password } = req.body;

        // Check required fields
        if (!userName || !email || !password) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Username, email and password are required')
                .build(res);
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
        });

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Sign up success')
            .withData(newUser)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR);
    }
};
