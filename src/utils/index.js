export const removeFieldsInArrayOfObject = (array, fields) => {
    return array.map((item) => {
        const plainItem = item.toObject();
        fields.forEach((field) => {
            delete plainItem[field];
        });
        return plainItem;
    });
};
