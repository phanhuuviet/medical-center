import { isNil } from 'lodash-es';

export const checkEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );
};

export const checkFieldRequire = (...fields) => {
    return fields.every((field) => !isNil(field));
};

export const checkTest = (fields) => {
    console.log('field', fields);
    for (const key in fields) {
        if (!fields[key]) {
            return key;
        }
    }
    return null;
};
