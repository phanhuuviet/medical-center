import bcrypt from 'bcryptjs';
import { isEmpty, isNil, keyBy } from 'lodash-es';

import ErrorMessage from '../constants/error-message.js';
import { MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM, PAGE_SIZE, SALT_ROUNDS } from '../constants/index.js';
import { ResponseCode } from '../constants/response-code.js';
import { USER_ROLE } from '../constants/role.js';
import ClinicScheduleModel from '../models/ClinicScheduleModel.js';
import LeaveScheduleModel from '../models/LeaveScheduleModel.js';
import MedicalConsultationHistoryModel from '../models/MedicalConsultationHistoryModel.js';
import UserModel, { DoctorModel } from '../models/UserModel.js';
import { doctorSchema } from '../schemas/user-schema.js';
import { getDateFromISOFormat, removeFieldsInArrayOfObject, removeUndefinedFields } from '../utils/index.js';
import ResponseBuilder from '../utils/response-builder.js';
import { checkEmail } from '../utils/validate.js';

import * as doctorWorkingScheduleService from './doctorWorkingScheduleService.js';
import { createHistoryLog } from './historyLogService.js';

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
        const role = req.role;
        const currentUserId = req.userId;
        const { userName, dateOfBirth, gender, province, district, address, commune, phoneNumber } = req.body;

        // Check if the user is trying to update their own information or an admin/doctor is updating another user's information
        if (userId !== currentUserId && role !== USER_ROLE.ADMIN && role !== USER_ROLE.DOCTOR) {
            return new ResponseBuilder()
                .withCode(ResponseCode.FORBIDDEN)
                .withMessage(ErrorMessage.FORBIDDEN)
                .build(res);
        }

        const updatedData = {
            userName,
            dateOfBirth,
            gender,
            province,
            district,
            commune,
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

        await createHistoryLog(userId, 'UPDATE', `Update user`, currentUserId, 'user', updatedUser._id);

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

        await createHistoryLog(userId, 'UPDATE', `Update avatar`, req.userId, 'user', updatedUser._id);

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
        const userId = req.params.id;
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

// [GET] ${PREFIX_API}/user/:doctorId/patients?isGetAllPatient=true&_page=_page&_pageSize=_pageSize&userName=userName
export const getAllPatientsByDoctor = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        const { isGetAllPatient, userName, _page = 1, _pageSize = PAGE_SIZE } = req.query;

        const page = Math.max(1, Number(_page));
        const pageSize = Math.max(1, Number(_pageSize));
        const skip = pageSize * (page - 1);

        if (isGetAllPatient) {
            const query = {
                ...(userName && { userName: { $regex: userName, $options: 'i' } }),
                role: USER_ROLE.USER,
            };

            const [patients, totalDocuments] = await Promise.all([
                UserModel.find(query).skip(skip).limit(pageSize),
                UserModel.countDocuments(query),
            ]);

            return new ResponseBuilder()
                .withCode(ResponseCode.SUCCESS)
                .withMessage('Get all patients success')
                .withData({
                    items: patients,
                    meta: { total: totalDocuments, page },
                })
                .build(res);
        }

        const checkDoctor = await DoctorModel.findById(doctorId);
        if (!checkDoctor) {
            return new ResponseBuilder().withCode(ResponseCode.NOT_FOUND).withMessage('Doctor is not found').build(res);
        }

        const query = {
            ...(userName && { userName: { $regex: userName, $options: 'i' } }),
            responsibilityDoctorId: doctorId,
            status: {
                $in: [MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM.DONE],
            },
        };

        // Lấy tất cả patientId duy nhất theo query
        const uniquePatientIds = await MedicalConsultationHistoryModel.distinct('patientId', query);

        // Tổng số bệnh nhân duy nhất
        const totalDocuments = uniquePatientIds.length;

        // Phân trang danh sách patientId
        const paginatedPatientIds = uniquePatientIds.slice(skip, skip + pageSize);

        // Lấy thông tin bệnh nhân
        const allPatients = await UserModel.find({ _id: { $in: paginatedPatientIds } });

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get doctor patients success')
            .withData({
                items: allPatients,
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

// [GET] ${PREFIX_API}/user/:doctorId/working-schedules?date=date
export const getDoctorWorkingSchedules = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        const date = req.query.date || new Date();

        const checkDoctor = await DoctorModel.findOne({ _id: doctorId });
        if (isNil(checkDoctor)) {
            return new ResponseBuilder().withCode(ResponseCode.NOT_FOUND).withMessage('Doctor is not found').build(res);
        }

        // Lấy tất cả ca làm việc trong 1 ngày
        // Lấy lịch làm việc của bác sĩ trong ngày đó
        // Lấy lịch nghỉ của bác sĩ trong ngày đó
        const [doctorWorkingSchedules, doctorShiftWorkingSchedules, doctorLeaveSchedules] = await Promise.all([
            ClinicScheduleModel.find({
                clinicId: checkDoctor.clinicId,
            }),
            MedicalConsultationHistoryModel.find({
                responsibilityDoctorId: doctorId,
                clinicId: checkDoctor.clinicId,
                examinationDate: {
                    $gte: new Date(date).setHours(0, 0, 0, 0),
                    $lt: new Date(date).setHours(23, 59, 59),
                },
            }),
            LeaveScheduleModel.find({
                doctorId,
                date: getDateFromISOFormat(date),
            }),
        ]);

        const serializeDoctorShiftWorkingSchedules = keyBy(doctorShiftWorkingSchedules, 'clinicScheduleId');
        const serializeDoctorLeaveSchedules = keyBy(doctorLeaveSchedules, 'clinicScheduleId');

        const response = doctorWorkingSchedules.map((schedule) => {
            const isWorking = serializeDoctorShiftWorkingSchedules[schedule._id] ? true : false;
            const isLeave = serializeDoctorLeaveSchedules[schedule._id] ? true : false;

            return {
                ...schedule.toObject(),
                isWorking,
                isLeave,
            };
        });

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get doctor working schedules success')
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
            commune,
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
            commune,
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
            commune,
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

// [PUT] ${PREFIX_API}/user/:doctorId/update-doctor
export const updateDoctor = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        const role = req.role;
        const currentUserId = req.userId;
        const {
            userName,
            dateOfBirth,
            gender,
            province,
            district,
            address,
            commune,
            phoneNumber,
            medicalServiceId,
            clinicId,
            specialty,
            qualification,
            description,
        } = req.body;

        // Check if the user is trying to update their own information or an admin/doctor is updating another user's information
        if (doctorId !== currentUserId && role !== USER_ROLE.ADMIN && role !== USER_ROLE.DOCTOR) {
            return new ResponseBuilder()
                .withCode(ResponseCode.FORBIDDEN)
                .withMessage(ErrorMessage.FORBIDDEN)
                .build(res);
        }

        const updatedData = {
            userName,
            dateOfBirth,
            gender,
            province,
            district,
            commune,
            address,
            phoneNumber,
            medicalServiceId,
            clinicId,
            specialty,
            qualification,
            description,
        };

        // Remove undefined values
        removeUndefinedFields(updatedData);

        const updatedDoctor = await DoctorModel.findByIdAndUpdate(
            doctorId,
            {
                $set: updatedData,
            },
            {
                new: true,
            },
        );

        if (!updatedDoctor) {
            return new ResponseBuilder().withCode(ResponseCode.NOT_FOUND).withMessage('Doctor is not found').build(res);
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Update doctor success')
            .withData(updatedDoctor)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
