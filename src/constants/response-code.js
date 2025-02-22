import ErrorMessage from './error-message.js';

export const ResponseCode = {
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    BAD_REQUEST: 400,
    SUCCESS: 200,
    CREATED: 201,
    NOT_ACCEPTABLE: 406,
};

const CODE_MESSAGES = {
    NOT_FOUND: ErrorMessage.NOT_FOUND,
    INTERNAL_SERVER_ERROR: ErrorMessage.INTERNAL_SERVER_ERROR,
    UNAUTHORIZED: ErrorMessage.UNAUTHORIZED,
    FORBIDDEN: ErrorMessage.FORBIDDEN,
    BAD_REQUEST: ErrorMessage.BAD_REQUEST,
    SUCCESS: ErrorMessage.SUCCESS,
    NOT_ACCEPTABLE: ErrorMessage.NOT_ACCEPTABLE,
};

export const getMessage = (code) => {
    return CODE_MESSAGES[ResponseCode[code]];
};
