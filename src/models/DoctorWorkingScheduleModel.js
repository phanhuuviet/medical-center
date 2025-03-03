import mongoose from 'mongoose';

const DoctorWorkingScheduleSchema = new mongoose.Schema(
    {
        doctorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Doctor' },
        clinicScheduleId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'ClinicSchedule' },
    },
    {
        timestamps: true,
        collection: 'DoctorWorkingSchedule',
    },
);

const DoctorWorkingScheduleModel = mongoose.model('DoctorWorkingSchedule', DoctorWorkingScheduleSchema);
export default DoctorWorkingScheduleModel;
