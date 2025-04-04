import bcrypt from 'bcryptjs';
import { isEmpty, isNil } from 'lodash-es';

import ErrorMessage from '../constants/error-message.js';
import { PAGE_SIZE, SALT_ROUNDS } from '../constants/index.js';
import { ResponseCode } from '../constants/response-code.js';
import { USER_ROLE } from '../constants/role.js';
import ClinicScheduleModel from '../models/ClinicScheduleModel.js';
import MedicalConsultationHistoryModel from '../models/MedicalConsultationHistoryModel.js';
import UserModel, { DoctorModel } from '../models/UserModel.js';
import { doctorSchema } from '../schemas/user-schema.js';
import { removeFieldsInArrayOfObject, removeUndefinedFields } from '../utils/index.js';
import ResponseBuilder from '../utils/response-builder.js';
import { checkEmail } from '../utils/validate.js';

import * as doctorWorkingScheduleService from './doctorWorkingScheduleService.js';

// [GET] ${PREFIX_API}/user?role=role&code=code&userName=userName&_page=_page&_pageSize=_pageSize
export const getAllUsers = async (req, res) => {
    try {
        const { role, code, userName, _page = 1, _pageSize = PAGE_SIZE } = req.query;

        const query = {
            ...(role && { role: +role }),
            ...(code && { code: { $regex: code, $options: 'i' } }),
            ...(userName && { userName: { $regex: userName, $options: 'i' } }),
        };

        const page = Math.max(1, Number(_page));
        const pageSize = Math.max(1, Number(_pageSize));
        const skip = pageSize * (page - 1);

        const [users, totalDocuments] = await Promise.all([
            UserModel.find(query).skip(skip).limit(pageSize),
            UserModel.countDocuments(query),
        ]);

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get all users success')
            .withData({
                items: users,
                meta: { total: totalDocuments, page },
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

// ========= DOCTOR =========
// [GET] ${PREFIX_API}/user/:doctorId/schedules
export const getDoctorSchedules = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;

        const checkDoctor = await DoctorModel.findOne({ _id: doctorId });
        if (isNil(checkDoctor)) {
            return new ResponseBuilder().withCode(ResponseCode.NOT_FOUND).withMessage('Doctor is not found').build(res);
        }

        const doctorSchedules = await MedicalConsultationHistoryModel.find({
            responsibilityDoctorId: checkDoctor._id,
        }).populate('clinicSchedule');

        const response = removeFieldsInArrayOfObject(doctorSchedules, ['clinicScheduleId']);

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get doctor schedules success')
            .withData(response)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [GET] ${PREFIX_API}/user/:doctorId/patients
export const getAllPatientsByDoctor = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;

        const checkDoctor = await DoctorModel.findOne({ _id: doctorId });
        if (isNil(checkDoctor)) {
            return new ResponseBuilder().withCode(ResponseCode.NOT_FOUND).withMessage('Doctor is not found').build(res);
        }

        const patients = await MedicalConsultationHistoryModel.find({ responsibilityDoctorId: doctorId });
        const patientIds = patients.map((patient) => patient.patientId);

        const allPatients = await UserModel.find({ _id: { $in: patientIds } });

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get doctor patients success')
            .withData(allPatients)
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

        const { error } = doctorSchema.validate({
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
