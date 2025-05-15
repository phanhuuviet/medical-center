import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import * as historyLogService from '../services/historyLogService.js';
import ResponseBuilder from '../utils/response-builder.js';

export const getHistoryLogByUserId = async (req, res) => {
    try {
        return await historyLogService.getHistoryLogByUserId(req, res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
