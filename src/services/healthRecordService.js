import { isNil } from 'lodash-es';

import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import HealthRecordModel from '../models/HealthRecordModel.js';
import { removeFieldsInObject } from '../utils/index.js';
import ResponseBuilder from '../utils/response-builder.js';

// [GET] ${PREFIX_API}/health-record/:userId
export const getHealthRecordByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const checkHealthRecord = await HealthRecordModel.findOne({ userId }).populate('user');

        if (isNil(checkHealthRecord)) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Health record is not found')
                .build(res);
        }

        const response = removeFieldsInObject(checkHealthRecord, ['userId']);

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get health record success')
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

// [PUT] ${PREFIX_API}/health-record/:userId
export const updateHealthRecord = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { bloodType, height, weight, healthHistory } = req.body;

        const checkHealthRecord = await HealthRecordModel.findOne({ userId });

        if (isNil(checkHealthRecord)) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('Health record is not found')
                .build(res);
        }

        const updateHealthRecord = await HealthRecordModel.findOneAndUpdate(
            {
                userId,
            },
            {
                bloodType,
                height,
                weight,
                healthHistory,
            },
            {
                new: true,
            },
        );

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Update health record success')
            .withData(updateHealthRecord)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// Create new health record
export const createHealthRecord = async ({ userId, bloodType, height, weight, healthHistory }) => {
    try {
        const healthRecord = await HealthRecordModel.create({
            userId,
            bloodType,
            height,
            weight,
            healthHistory,
        });
        return healthRecord;
    } catch (error) {
        console.log('Error', error);
        return null;
    }
};
