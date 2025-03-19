import { groupBy, isArray } from 'lodash-es';

import { MONTHS_STRING } from '../constants/index.js';

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

export const getDateFromISOFormat = (date) => {
    const dateObj = new Date(date);
    return dateObj.toISOString().split('T')[0];
};

export const getDaysInMonth = (month, year) => {
    var date = new Date(year, month, 1);
    var days = [];
    while (date.getMonth() === month) {
        days.push(new Date(date).getDate() + '');
        date.setDate(date.getDate() + 1);
    }
    return days;
};

export const calculateTotalBykeyGroupByDays = (data, month, year, key) => {
    if (!isArray(data) || !month || !year || !key) {
        return [];
    }

    const daysInMonth = getDaysInMonth(month - 1, year);

    const groupByDay = groupBy(data, (record) => record?.[key].getDate());

    return daysInMonth.map((day) => {
        const total = groupByDay[day] ? groupByDay[day].length : 0;
        return {
            day,
            total,
        };
    });
};

export const calculateTotalByKeyGroupByMonth = (data, key) => {
    if (!isArray(data) || !key) {
        return [];
    }

    const groupByMonth = groupBy(data, (record) => record?.[key].getMonth() + 1);

    return MONTHS_STRING.map((month) => {
        const total = groupByMonth[month] ? groupByMonth[month].length : 0;

        return {
            month,
            total,
        };
    });
};

export const calculateTotalByKeyGroupByYear = (data, key, startYear, endYear) => {
    if (!isArray(data) || !key || !startYear || !endYear) {
        return [];
    }

    const groupByYear = groupBy(data, (record) => record?.[key].getFullYear());

    const years = [];
    for (let year = startYear; year <= endYear; year++) {
        const total = groupByYear[year] ? groupByYear[year].length : 0;
        years.push({
            year,
            total,
        });
    }

    return years;
};
