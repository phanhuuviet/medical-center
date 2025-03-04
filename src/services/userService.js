import bcrypt from 'bcryptjs';
import { isEmpty, isNil } from 'lodash-es';

import ErrorMessage from '../constants/error-message.js';
import { SALT_ROUNDS } from '../constants/index.js';
import { ResponseCode } from '../constants/response-code.js';
import { USER_ROLE } from '../constants/role.js';
import ClinicScheduleModel from '../models/ClinicScheduleModel.js';
import UserModel, { DoctorModel } from '../models/UserModel.js';
import { removeUndefinedFields } from '../utils/index.js';
import ResponseBuilder from '../utils/response-builder.js';
import { checkEmail, checkFieldRequire } from '../utils/validate.js';

import * as doctorWorkingScheduleService from './doctorWorkingScheduleService.js';

// [GET] ${PREFIX_API}/user
export const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find();

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get all users success')
            .withData(users)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

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

// [POST] ${PREFIX_API}/user/create-doctor
export const createDoctor = async (req, res) => {
    try {
        const {
            userName,
            email,
            password,
            dateOfBirth,
            gender,
            province,
            district,
            address,
            clinicId,
            medicalServiceId,
            specialty,
            qualification,
            description,
        } = req.body;

        // Check required fields
        if (
            !checkFieldRequire(
                userName,
                email,
                password,
                dateOfBirth,
                gender,
                province,
                district,
                clinicId,
                specialty,
                qualification,
            )
        ) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage(ErrorMessage.MISSING_REQUIRED_FIELDS)
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

        const newUser = await DoctorModel.create({
            userName,
            email,
            password: hashPassword,
            dateOfBirth,
            gender,
            province,
            district,
            address,
            clinicId,
            medicalServiceId,
            specialty,
            qualification,
            description,
            role: USER_ROLE.DOCTOR,
        });

        // Fetch schedule of clinic and create record of DoctorWorkingSchedule table
        const clinicSchedules = await ClinicScheduleModel.find({ clinicId });

        if (!isEmpty(clinicSchedules)) {
            const listDataInsert = clinicSchedules.map((clinicSchedule) => ({
                doctorId: newUser._id,
                clinicScheduleId: clinicSchedule._id,
            }));

            await doctorWorkingScheduleService.insertManyDoctorWorkingSchedule(listDataInsert);
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Create doctor success')
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
