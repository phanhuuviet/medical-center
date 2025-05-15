import { isNil } from 'lodash-es';

import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import HistoryLogModel from '../models/HistoryLogModel.js';
import ResponseBuilder from '../utils/response-builder.js';

// [GET] ${PREFIX_API}/history-log/:userId
export const getHistoryLogByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const checkHistoryLog = await HistoryLogModel.find({ userId }).populate('user').populate('updatedByUser');

        if (isNil(checkHistoryLog)) {
            return new ResponseBuilder()
                .withCode(ResponseCode.NOT_FOUND)
                .withMessage('History log is not found')
                .build(res);
        }

        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Get history log success')
            .withData(checkHistoryLog)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};

// FUNCTIONS
export const createHistoryLog = async (userId, action, details, updatedByUserId, entity, entityId) => {
    try {
        const historyLog = new HistoryLogModel({
            userId,
            action,
            details,
            updatedByUserId,
            entity,
            entityId,
        });

        await historyLog.save();
    } catch (error) {
        console.error('Error creating history log:', error);
    }
};
