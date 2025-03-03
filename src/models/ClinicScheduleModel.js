import mongoose from 'mongoose';

const ClinicScheduleSchema = new mongoose.Schema(
    {
        clinicId: { type: mongoose.Schema.Types.ObjectId, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
    },
    {
        timestamps: true,
        collection: 'ClinicSchedule',
    },
);

const ClinicScheduleModel = mongoose.model('ClinicSchedule', ClinicScheduleSchema);
export default ClinicScheduleModel;
