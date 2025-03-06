import { isNil } from 'lodash-es';

import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import { USER_ROLE } from '../constants/role.js';
import ClinicScheduleModel from '../models/ClinicScheduleModel.js';
import MedicalServiceModel from '../models/MedicalServiceModel.js';
import { DoctorModel } from '../models/UserModel.js';
import { removeUndefinedFields } from '../utils/index.js';
import ResponseBuilder from '../utils/response-builder.js';
import { checkFieldRequire } from '../utils/validate.js';

// [GET] ${PREFIX_API}/medical-service
export const getAllMedicalService = async (req, res) => {
    try {
        const medicalServices = await MedicalServiceModel.find();

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get all medical services success')
            .withData(medicalServices)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [GET] ${PREFIX_API}/medical-service/:id
export const getMedicalServiceById = async (req, res) => {
    try {
        const medicalServiceId = req.params.id;
        const checkMedicalService = await MedicalServiceModel.findOne({ _id: medicalServiceId });

        if (!checkMedicalService) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Medical service is not found')
                .build(res);
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get medical service success')
            .withData(checkMedicalService)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [GET] ${PREFIX_API}/medical-service/:id/schedules
export const getMedicalServiceSchedules = async (req, res) => {
    try {
        const medicalServiceId = req.params.id;

        const checkMedicalService = await MedicalServiceModel.findOne({ _id: medicalServiceId });
        if (isNil(checkMedicalService)) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Medical service is not found')
                .build(res);
        }

        const schedules = await ClinicScheduleModel.find({ clinicId: checkMedicalService.clinicId });

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get medical service schedules success')
            .withData(schedules)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [POST] ${PREFIX_API}/medical-service
export const createMedicalService = async (req, res) => {
    try {
        const { name, originalPrice, currentPrice, type, clinicId, doctorIds } = req.body;

        if (!checkFieldRequire(name, currentPrice, type, clinicId)) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage(ErrorMessage.MISSING_REQUIRED_FIELDS)
                .build(res);
        }

        const newMedicalService = await MedicalServiceModel.create({
            name,
            originalPrice,
            currentPrice,
            type,
            clinicId,
        });

        await DoctorModel.updateMany(
            {
                _id: { $in: doctorIds },
                role: { $eq: USER_ROLE.DOCTOR },
                medicalServiceId: { $eq: null },
                clinicId: { $eq: clinicId },
            },
            { $set: { medicalServiceId: newMedicalService._id } },
        );

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Create medical service success')
            .withData(newMedicalService)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [PUT] ${PREFIX_API}/medical-service/:id
export const updateMedicalService = async (req, res) => {
    try {
        const medicalServiceId = req.params.id;
        const { name, originalPrice, currentPrice, type, clinicId, doctorIds } = req.body;

        // if (!checkFieldRequire(name, currentPrice, type, clinicId)) {
        //     return new ResponseBuilder()
        //         .withCode(ResponseCode.BAD_REQUEST)
        //         .withMessage(ErrorMessage.MISSING_REQUIRED_FIELDS)
        //         .build(res);
        // }

        const checkMedicalService = await MedicalServiceModel.findOne({ _id: medicalServiceId });

        if (!checkMedicalService) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Medical service is not found')
                .build(res);
        }

        const updatedData = {
            name,
            originalPrice,
            currentPrice,
            type,
            clinicId,
            // doctorIds,
        };

        // Remove undefined values
        removeUndefinedFields(updatedData);

        const newMedicalService = await MedicalServiceModel.findByIdAndUpdate({ _id: medicalServiceId }, updatedData, {
            new: true,
        });

        await DoctorModel.bulkWrite([
            {
                updateMany: {
                    filter: {
                        _id: { $in: doctorIds },
                        role: USER_ROLE.DOCTOR,
                        medicalServiceId: { $eq: null },
                        clinicId: { $eq: newMedicalService.clinicId },
                    },
                    update: { $set: { medicalServiceId: newMedicalService._id } },
                },
            },
            {
                updateMany: {
                    filter: {
                        _id: { $nin: doctorIds },
                        role: USER_ROLE.DOCTOR,
                        medicalServiceId: newMedicalService._id,
                        clinicId: { $eq: newMedicalService.clinicId },
                    },
                    update: { $set: { medicalServiceId: null } },
                },
            },
        ]);

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Update medical service success')
            .withData(newMedicalService)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [DELETE] ${PREFIX_API}/medical-service/:id
export const deleteMedicalService = async (req, res) => {
    try {
        const medicalServiceId = req.params.id;
        const checkMedicalService = await MedicalServiceModel.findOne({ _id: medicalServiceId });

        if (!checkMedicalService) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Medical service is not found')
                .build(res);
        }

        await MedicalServiceModel.deleteOne({ _id: medicalServiceId });

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Delete medical service success')
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
