import { isNil } from 'lodash-es';

import ErrorMessage from '../constants/error-message.js';
import { ACTIVE_STATUS, PAGE_SIZE } from '../constants/index.js';
import { ResponseCode } from '../constants/response-code.js';
import ClinicModel from '../models/ClinicModel.js';
import { clinicSchema } from '../schemas/clinic-schema.js';
import { removeUndefinedFields } from '../utils/index.js';
import ResponseBuilder from '../utils/response-builder.js';
import { checkEmail } from '../utils/validate.js';

// [GET] ${PREFIX_API}/clinic?name=name&address=address&status=status&_page=_page&_pageSize=_pageSize
export const getAllClinic = async (req, res) => {
    try {
        const { name, address, status, _page = 1, _pageSize = PAGE_SIZE } = req.query;

        const query = {
            ...(name && { name: { $regex: name, $options: 'i' } }),
            ...(address && { address: { $regex: address, $options: 'i' } }),
            ...(status && { status: +status }),
        };

        const page = Math.max(1, Number(_page));
        const pageSize = Math.max(1, Number(_pageSize));
        const skip = pageSize * (page - 1);

        const [clinics, totalDocuments] = await Promise.all([
            ClinicModel.find(query).skip(skip).limit(pageSize),
            ClinicModel.countDocuments(query),
        ]);

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get clinic success')
            .withData({
                items: clinics,
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

        const { error } = clinicSchema.validate({ name, email, hotline, address });
        const messageError = error?.details[0].message;

        if (messageError) {
            return new ResponseBuilder().withCode(ResponseCode.BAD_REQUEST).withMessage(messageError).build(res);
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

        const { error } = clinicSchema.validate({ name, email, hotline, address });
        const messageError = error?.details[0].message;

        if (messageError) {
            return new ResponseBuilder().withCode(ResponseCode.BAD_REQUEST).withMessage(messageError).build(res);
        }

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

// [PUT] ${PREFIX_API}/clinic/:id/active
export const activeClinic = async (req, res) => {
    try {
        const clinicId = req.params.id;

        const checkClinic = await ClinicModel.findOne({ _id: clinicId });

        if (isNil(checkClinic)) {
            return new ResponseBuilder().withCode(ResponseCode.NOT_FOUND).withMessage('Clinic is not found').build(res);
        }

        const response = await ClinicModel.findOneAndUpdate(
            { _id: clinicId },
            { status: ACTIVE_STATUS.ACTIVE },
            {
                new: true,
            },
        );

        return new ResponseBuilder()
            .withData(response)
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Active clinic success')
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// [PUT] ${PREFIX_API}/clinic/:id/inactive
export const inActiveClinic = async (req, res) => {
    try {
        const clinicId = req.params.id;

        const checkClinic = await ClinicModel.findOne({ _id: clinicId });

        if (isNil(checkClinic)) {
            return new ResponseBuilder().withCode(ResponseCode.NOT_FOUND).withMessage('Clinic is not found').build(res);
        }

        const response = await ClinicModel.findOneAndUpdate(
            { _id: clinicId },
            { status: ACTIVE_STATUS.INACTIVE },
            {
                new: true,
            },
        );

        return new ResponseBuilder()
            .withData(response)
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Unactive clinic success')
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
