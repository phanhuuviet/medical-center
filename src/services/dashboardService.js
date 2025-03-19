import { endOfMonth, endOfYear, startOfMonth, startOfYear } from 'date-fns';

import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import { USER_ROLE } from '../constants/role.js';
import MedicalConsultationHistoryModel from '../models/MedicalConsultationHistoryModel.js';
import UserModel from '../models/UserModel.js';
import { dashboardSchema } from '../schemas/dashboard-schema.js';
import {
    calculateTotalBykeyGroupByDays,
    calculateTotalByKeyGroupByMonth,
    calculateTotalByKeyGroupByYear,
} from '../utils/index.js';
import ResponseBuilder from '../utils/response-builder.js';

// [GET] ${PREFIX_API}/dashboard/consultation-history-record?month=month&year=year&clinicId=clinicId
export const getMedicalConsultationHistory = async (req, res) => {
    try {
        const { month, year, clinicId } = req.query;

        // Validate
        const { error } = dashboardSchema.validate({ month, year });
        const messageError = error?.details[0].message;

        if (messageError) {
            return new ResponseBuilder().withCode(ResponseCode.BAD_REQUEST).withMessage(messageError).build(res);
        }

        // Create query
        const query = {};
        let allConsultationHistoryRecord = [];

        if (clinicId) {
            query.clinicId = clinicId;
        }

        if (year && month) {
            const startOfMonthFilter = startOfMonth(new Date(year, month - 1));
            const endOfMonthFilter = endOfMonth(new Date(year, month - 1));

            query.examinationDate = {
                $gte: startOfMonthFilter,
                $lte: endOfMonthFilter,
            };

            const consultationHistoryRecordFilter = await MedicalConsultationHistoryModel.find(query);

            allConsultationHistoryRecord = calculateTotalBykeyGroupByDays(
                consultationHistoryRecordFilter,
                month,
                year,
                'examinationDate',
            );
        } else if (year) {
            const startOfYearFilter = startOfYear(new Date(year));
            const endOfYearFilter = endOfYear(new Date(year));

            query.examinationDate = {
                $gte: startOfYearFilter,
                $lte: endOfYearFilter,
            };
            const consultationHistoryRecordFilter = await MedicalConsultationHistoryModel.find(query);

            allConsultationHistoryRecord = calculateTotalByKeyGroupByMonth(
                consultationHistoryRecordFilter,
                'examinationDate',
            );
        } else {
            const consultationHistoryRecordFilter = await MedicalConsultationHistoryModel.find(query);

            allConsultationHistoryRecord = calculateTotalByKeyGroupByYear(
                consultationHistoryRecordFilter,
                'examinationDate',
                new Date().getFullYear() - 1,
                new Date().getFullYear() + 1,
            );
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get consultation history record success')
            .withData(allConsultationHistoryRecord)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [GET] ${PREFIX_API}/dashboard/doctor?month=month&year=year&clinicId=clinicId
export const getDoctorDashboard = async (req, res) => {
    try {
        const { month, year, clinicId } = req.query;

        // Validate
        const { error } = dashboardSchema.validate({ month, year });
        const messageError = error?.details[0].message;

        if (messageError) {
            return new ResponseBuilder().withCode(ResponseCode.BAD_REQUEST).withMessage(messageError).build(res);
        }

        // Create query
        const query = {
            role: USER_ROLE.DOCTOR,
        };
        let allDoctor = [];

        if (clinicId) {
            query.clinicId = clinicId;
        }

        if (year && month) {
            const startOfMonthFilter = startOfMonth(new Date(year, month - 1));
            const endOfMonthFilter = endOfMonth(new Date(year, month - 1));

            query.createdAt = {
                $gte: startOfMonthFilter,
                $lte: endOfMonthFilter,
            };

            const doctorsFilter = await UserModel.find(query);

            allDoctor = calculateTotalBykeyGroupByDays(doctorsFilter, month, year, 'createdAt');
        } else if (year) {
            const startOfYearFilter = startOfYear(new Date(year));
            const endOfYearFilter = endOfYear(new Date(year));

            query.createdAt = {
                $gte: startOfYearFilter,
                $lte: endOfYearFilter,
            };
            const doctorsFilter = await UserModel.find(query);

            allDoctor = calculateTotalByKeyGroupByMonth(doctorsFilter, 'createdAt');
        } else {
            const doctorsFilter = await UserModel.find(query);

            allDoctor = calculateTotalByKeyGroupByYear(
                doctorsFilter,
                'createdAt',
                new Date().getFullYear() - 1,
                new Date().getFullYear() + 1,
            );
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get consultation history record success')
            .withData(allDoctor)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [GET] ${PREFIX_API}/dashboard/patient?month=month&year=year
export const getPatientDashboard = async (req, res) => {
    try {
        const { month, year } = req.query;

        // Validate
        const { error } = dashboardSchema.validate({ month, year });
        const messageError = error?.details[0].message;

        if (messageError) {
            return new ResponseBuilder().withCode(ResponseCode.BAD_REQUEST).withMessage(messageError).build(res);
        }

        // Create query
        const query = {
            role: USER_ROLE.USER,
        };
        let allPatient = [];

        if (year && month) {
            const startOfMonthFilter = startOfMonth(new Date(year, month - 1));
            const endOfMonthFilter = endOfMonth(new Date(year, month - 1));

            query.createdAt = {
                $gte: startOfMonthFilter,
                $lte: endOfMonthFilter,
            };

            const patientsFilter = await UserModel.find(query);

            allPatient = calculateTotalBykeyGroupByDays(patientsFilter, month, year, 'createdAt');
        } else if (year) {
            const startOfYearFilter = startOfYear(new Date(year));
            const endOfYearFilter = endOfYear(new Date(year));

            query.createdAt = {
                $gte: startOfYearFilter,
                $lte: endOfYearFilter,
            };
            const patientsFilter = await UserModel.find(query);

            allPatient = calculateTotalByKeyGroupByMonth(patientsFilter, 'createdAt');
        } else {
            const patientsFilter = await UserModel.find(query);

            allPatient = calculateTotalByKeyGroupByYear(
                patientsFilter,
                'createdAt',
                new Date().getFullYear() - 1,
                new Date().getFullYear() + 1,
            );
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get consultation history record success')
            .withData(allPatient)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
