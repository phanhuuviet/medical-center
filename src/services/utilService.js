import ErrorMessage from '../constants/error-message.js';
import { ResponseCode } from '../constants/response-code.js';
import { signInSchema } from '../schemas/auth-schema.js';
import ResponseBuilder from '../utils/response-builder.js';

// [POST] ${PREFIX_API}/util/upload-file
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

// [...] ${PREFIX_API}/util/test-api
export const testAPI = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { error } = signInSchema.validate({ email, password });
        console.log('error', error);

        const messageError = error?.details[0].message;
        if (messageError) {
            return new ResponseBuilder().withCode(ResponseCode.BAD_REQUEST).withMessage(messageError).build(res);
        }

        return new ResponseBuilder().withCode(ResponseCode.SUCCESS).withMessage('Test API successfully').build(res);
    } catch (error) {
        console.log('Error', error);
        return new ResponseBuilder()
            .withCode(ResponseCode.INTERNAL_SERVER_ERROR)
            .withMessage(ErrorMessage.INTERNAL_SERVER_ERROR)
            .build(res);
    }
};
