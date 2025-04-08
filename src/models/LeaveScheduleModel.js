import mongoose from 'mongoose';

import { ACTIVE_STATUS } from '../constants/index.js';

const LeaveScheduleSchema = new mongoose.Schema(
    {
        clinicScheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClinicSchedule', required: true },
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: String, required: true },
        reason: { type: String },
        status: { type: Number, default: ACTIVE_STATUS.ACTIVE, enum: [ACTIVE_STATUS.ACTIVE, ACTIVE_STATUS.INACTIVE] },
    },
    {
        timestamps: true,
        collection: 'LeaveSchedule',
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    },
);

LeaveScheduleSchema.virtual('clinicSchedule', {
    ref: 'ClinicSchedule',
    localField: 'clinicScheduleId',
    foreignField: '_id',
    justOne: true,
});

LeaveScheduleSchema.virtual('doctor', {
    ref: 'User',
    localField: 'doctorId',
    foreignField: '_id',
    justOne: true,
});

const LeaveScheduleModel = mongoose.model('LeaveSchedule', LeaveScheduleSchema);
export default LeaveScheduleModel;
