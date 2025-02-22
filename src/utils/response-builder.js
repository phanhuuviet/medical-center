import { getMessage, ResponseCode } from '../constants/response-code.js';

class ResponseBuilder {
    constructor(data) {
        this.payload = {
            data: data || null,
            statusCode: ResponseCode.SUCCESS,
            message: '',
        };
    }

    withCode(code, withMessage = true) {
        this.payload.statusCode = code;
        if (withMessage) {
            this.payload.message = getMessage(code);
        }
        return this;
    }

    withMessage(message) {
        this.payload.message = message;
        return this;
    }

    withData(data) {
        this.payload.data = data;
        return this;
    }

    build(res) {
        // Ensure data is null if it's undefined, empty object, or null (but keep empty array)
        if (
            this.payload.data === undefined ||
            this.payload.data === null ||
            (typeof this.payload.data === 'object' &&
                !Array.isArray(this.payload.data) &&
                Object.keys(this.payload.data).length === 0)
        ) {
            this.payload.data = null;
        }
        console.log('🚀 Final Response:', this.payload);

        return res.status(this.payload.statusCode).json(this.payload);
    }
}

export default ResponseBuilder;
