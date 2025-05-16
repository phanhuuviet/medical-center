import mongoose from 'mongoose';

const requestChangeScheduleModel = new mongoose.Schema(
    {
        name: { type: String, required: true },
        clinicId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Clinic' },
        applyDate: { type: Date, required: true },
        newValue: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'ClinicSchedule',
            },
        ],
    },
    {
        timestamps: true,
        collection: 'RequestChangeSchedule',
    },
);

const RequestChangeScheduleModel = mongoose.model('RequestChangeSchedule', requestChangeScheduleModel);
export default RequestChangeScheduleModel;
