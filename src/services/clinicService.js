import { isNil } from 'lodash-es';

import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import ClinicModel from '../models/ClinicModel.js';
import { removeUndefinedFields } from '../utils/index.js';
import ResponseBuilder from '../utils/response-builder.js';
import { checkEmail } from '../utils/validate.js';

// [GET] ${PREFIX_API}/clinic?name=name&address=address&status=status
export const getAllClinic = async (req, res) => {
    try {
        const { name, address, status } = req.query;
        const query = {};
        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }
        if (address) {
            query.address = { $regex: address, $options: 'i' };
        }
        if (status) {
            query.status = +status;
        }

        const clinics = await ClinicModel.find();
        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get clinic success')
            .withData(clinics)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [GET] ${PREFIX_API}/clinic/:id
export const getClinicById = async (req, res) => {
    try {
        const clinicId = req.params.id;
        const checkClinic = await ClinicModel.findOne({ _id: clinicId });

        if (isNil(checkClinic)) {
            return new ResponseBuilder().withCode(ResponseCode.NOT_FOUND).withMessage('Clinic is not found').build(res);
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get clinic success')
            .withData(checkClinic)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [POST] ${PREFIX_API}/clinic
export const createClinic = async (req, res) => {
    try {
        const { name, email, hotline, address, description } = req.body;
        if (!name || !email || !hotline || !address) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage(ErrorMessage.MISSING_REQUIRED_FIELDS)
                .build(res);
        } else if (!checkEmail(email)) {
            return new ResponseBuilder().withCode(ResponseCode.BAD_REQUEST).withMessage('Email is invalid').build(res);
        }

        const checkClinic = await ClinicModel.findOne({
            name,
        });
        if (!isNil(checkClinic)) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Clinic is already exist')
                .build(res);
        }

        const newClinic = await ClinicModel.create({
            name,
            email,
            hotline,
            address,
            description,
        });

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Create clinic success')
            .withData(newClinic)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [PUT] ${PREFIX_API}/clinic/:id/update
export const updateClinic = async (req, res) => {
    try {
        const clinicId = req.params.id;
        const { name, email, hotline, address, description } = req.body;

        const updatedData = {
            name,
            email,
            hotline,
            address,
            description,
        };

        // Remove undefined values
        removeUndefinedFields(updatedData);

        const updatedClinic = await ClinicModel.findOneAndUpdate({ _id: clinicId }, updatedData, { new: true });

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Update clinic success')
            .withData(updatedClinic)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [PUT] ${PREFIX_API}/clinic/:id/update-logo
export const updateLogo = async (req, res) => {
    try {
        const file = req.file;
        const clinicId = req.params.id;

        const updatedClinic = await ClinicModel.findByIdAndUpdate(
            clinicId,
            {
                $set: {
                    logo: file.path,
                },
            },
            {
                new: true,
            },
        );

        if (!updatedClinic) {
            return new ResponseBuilder().withCode(ResponseCode.NOT_FOUND).withMessage('Clinic is not found').build(res);
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Update avatar success')
            .withData(updatedClinic)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [DELETE] ${PREFIX_API}/clinic/:id
export const deleteClinic = async (req, res) => {
    try {
        const clinicId = req.params.id;

        const checkClinic = await ClinicModel.findOne({ _id: clinicId });

        if (isNil(checkClinic)) {
            return new ResponseBuilder().withCode(ResponseCode.NOT_FOUND).withMessage('Clinic is not found').build(res);
        }

        await ClinicModel.deleteOne({ _id: clinicId });

        return new ResponseBuilder().withCode(ResponseCode.SUCCESS).withMessage('Delete clinic success').build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
