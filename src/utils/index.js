export const removeFieldsInArrayOfObject = (array, fields) => {
    return array.map((item) => {
        const plainItem = item.toObject();
        fields.forEach((field) => {
            delete plainItem[field];
        });
        return plainItem;
    });
};

export const removeFieldsInObject = (obj, fields) => {
    const plainObj = obj.toObject();
    fields.forEach((field) => {
        delete plainObj[field];
    });
    return plainObj;
};

export const removeUndefinedFields = (obj) => {
    return Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
};
