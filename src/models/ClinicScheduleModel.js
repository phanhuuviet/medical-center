import mongoose from 'mongoose';

import { addtionalFindField, addtionalFindOneField } from '../middlewares/clinicScheduleMiddleware.js';

const ClinicScheduleSchema = new mongoose.Schema(
    {
        clinicId: { type: mongoose.Schema.Types.ObjectId, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        collection: 'ClinicSchedule',
    },
);

ClinicScheduleSchema.plugin(addtionalFindField);
ClinicScheduleSchema.plugin(addtionalFindOneField);

const ClinicScheduleModel = mongoose.model('ClinicSchedule', ClinicScheduleSchema);
export default ClinicScheduleModel;
