import { isNil } from 'lodash-es';

import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import UserModel from '../models/UserModel.js';
import ResponseBuilder from '../utils/response-builder.js';
import { removeUndefinedFields } from '../utils/validate.js';

// [GET] ${PREFIX_API}/user/me
export const getMe = async (req, res) => {
    try {
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
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [GET] ${PREFIX_API}/user/:id
export const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
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
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [PUT] ${PREFIX_API}/user/:id/update
export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { userName, dateOfBirth, gender, province, district, address, phoneNumber } = req.body;

        const updatedData = {
            userName,
            dateOfBirth,
            gender,
            province,
            district,
            address,
            phoneNumber,
        };

        // Remove undefined values
        removeUndefinedFields(updatedData);

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                $set: updatedData,
            },
            {
                new: true,
            },
        );

        if (!updatedUser) {
            return new ResponseBuilder().withCode(ResponseCode.NOT_FOUND).withMessage('User is not found').build(res);
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Update user success')
            .withData(updatedUser)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [PUT] ${PREFIX_API}/user/:id/update-avatar
export const updateAvatar = async (req, res) => {
    try {
        const file = req.file;
        const userId = req.params.id;

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                $set: {
                    avatar: file.path,
                },
            },
            {
                new: true,
            },
        );

        if (!updatedUser) {
            return new ResponseBuilder().withCode(ResponseCode.NOT_FOUND).withMessage('User is not found').build(res);
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Update avatar success')
            .withData(updatedUser)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [DELETE] ${PREFIX_API}/user/:id/delete
export const deleteUser = async (req, res) => {
    try {
        const userId = req.userId;
        const checkUser = await UserModel.findOne({ _id: userId });

        if (isNil(checkUser)) {
            return new ResponseBuilder().withCode(ResponseCode.NOT_FOUND).withMessage('User is not found').build(res);
        }

        await UserModel.findByIdAndDelete(userId);

        return new ResponseBuilder().withCode(ResponseCode.SUCCESS).withMessage('Delete user success').build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
