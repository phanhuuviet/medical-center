import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import ResponseBuilder from '../utils/response-builder.js';

export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return new ResponseBuilder()
                .withCode(ResponseCode.BAD_REQUEST)
                .withMessage('Please upload image')
                .build(res);
        }
        return new ResponseBuilder()
            .withCode(ResponseCode.SUCCESS)
            .withMessage('Upload image successfully')
            .withData(req.file)
            .build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
