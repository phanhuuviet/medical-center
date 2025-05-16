export const addtionalFindField = (schema) => {
    schema.pre('find', function (next) {
        if (!this?.getOptions().disableIsActiveFilter) {
            this.where({
                isActive: { $ne: false },
            });
        }
        next();
    });
};

export const addtionalFindOneField = (schema) => {
    schema.pre('findOne', function (next) {
        if (!this?.getOptions().disableIsActiveFilter) {
            this.where({
                isActive: { $ne: false },
            });
        }
        next();
    });
};
