import mongoose from 'mongoose';

import DoctorWorkingScheduleModel from '../models/DoctorWorkingScheduleModel.js';

export const insertManyDoctorWorkingSchedule = async (data) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const queryInsert = data?.map((item) => ({
            insertOne: {
                document: {
                    doctorId: item.doctorId,
                    clinicScheduleId: item.clinicScheduleId,
                },
            },
        }));

        await DoctorWorkingScheduleModel.bulkWrite(queryInsert);

        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new Error(error);
    }
};
