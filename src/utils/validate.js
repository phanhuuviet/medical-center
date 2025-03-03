import { isNil } from 'lodash-es';

export const checkEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );
};

export const removeUndefinedFields = (obj) => {
    return Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
};

export const checkFieldRequire = (...fields) => {
    return fields.every((field) => !isNil(field));
};
