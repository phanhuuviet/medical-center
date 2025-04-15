import { endOfMonth, endOfYear, startOfMonth, startOfYear } from 'date-fns';

import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import { USER_ROLE } from '../constants/role.js';
import MedicalConsultationHistoryModel from '../models/MedicalConsultationHistoryModel.js';
import UserModel from '../models/UserModel.js';
import { dashboardSchema } from '../schemas/dashboard-schema.js';
import {
    calculateNumberBykeyGroupByDays,
    calculateNumberByKeyGroupByMonth,
    calculateNumberByKeyGroupByYear,
    calculateRevenueBykeyGroupByDays,
    calculateRevenueByKeyGroupByMonth,
    calculateRevenueByKeyGroupByYear,
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

            allConsultationHistoryRecord = calculateNumberBykeyGroupByDays(
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

            allConsultationHistoryRecord = calculateNumberByKeyGroupByMonth(
                consultationHistoryRecordFilter,
                'examinationDate',
            );
        } else {
            const consultationHistoryRecordFilter = await MedicalConsultationHistoryModel.find(query);

            allConsultationHistoryRecord = calculateNumberByKeyGroupByYear(
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

            allDoctor = calculateNumberBykeyGroupByDays(doctorsFilter, month, year, 'createdAt');
        } else if (year) {
            const startOfYearFilter = startOfYear(new Date(year));
            const endOfYearFilter = endOfYear(new Date(year));

            query.createdAt = {
                $gte: startOfYearFilter,
                $lte: endOfYearFilter,
            };
            const doctorsFilter = await UserModel.find(query);

            allDoctor = calculateNumberByKeyGroupByMonth(doctorsFilter, 'createdAt');
        } else {
            const doctorsFilter = await UserModel.find(query);

            allDoctor = calculateNumberByKeyGroupByYear(
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

            allPatient = calculateNumberBykeyGroupByDays(patientsFilter, month, year, 'createdAt');
        } else if (year) {
            const startOfYearFilter = startOfYear(new Date(year));
            const endOfYearFilter = endOfYear(new Date(year));

            query.createdAt = {
                $gte: startOfYearFilter,
                $lte: endOfYearFilter,
            };
            const patientsFilter = await UserModel.find(query);

            allPatient = calculateNumberByKeyGroupByMonth(patientsFilter, 'createdAt');
        } else {
            const patientsFilter = await UserModel.find(query);

            allPatient = calculateNumberByKeyGroupByYear(
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

// [GET] ${PREFIX_API}/dashboard/revenue?month=month&year=year&clinicId=clinicId&status=status
export const getRevenueDashboard = async (req, res) => {
    try {
        const { month, year, clinicId, status } = req.query;

        // Validate
        const { error } = dashboardSchema.validate({ month, year });
        const messageError = error?.details[0].message;

        if (messageError) {
            return new ResponseBuilder().withCode(ResponseCode.BAD_REQUEST).withMessage(messageError).build(res);
        }

        // Create query
        const query = {};
        let allRevenue = [];

        if (clinicId) {
            query.clinicId = clinicId;
        }

        if (status) {
            query.status = status;
        }

        if (year && month) {
            const startOfMonthFilter = startOfMonth(new Date(year, month - 1));
            const endOfMonthFilter = endOfMonth(new Date(year, month - 1));

            query.examinationDate = {
                $gte: startOfMonthFilter,
                $lte: endOfMonthFilter,
            };

            const revenueFilter = await MedicalConsultationHistoryModel.find(query);

            allRevenue = calculateRevenueBykeyGroupByDays(revenueFilter, month, year, 'examinationDate');
        } else if (year) {
            const startOfYearFilter = startOfYear(new Date(year));
            const endOfYearFilter = endOfYear(new Date(year));

            query.examinationDate = {
                $gte: startOfYearFilter,
                $lte: endOfYearFilter,
            };
            const revenueFilter = await MedicalConsultationHistoryModel.find(query);

            allRevenue = calculateRevenueByKeyGroupByMonth(revenueFilter, 'examinationDate');
        } else {
            const revenueFilter = await MedicalConsultationHistoryModel.find(query);

            allRevenue = calculateRevenueByKeyGroupByYear(
                revenueFilter,
                'examinationDate',
                new Date().getFullYear() - 1,
                new Date().getFullYear() + 1,
            );
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get consultation history record success')
            .withData(allRevenue)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
