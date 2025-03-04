import mongoose from 'mongoose';

const LeaveScheduleSchema = new mongoose.Schema(
    {
        clinicScheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClinicSchedule', required: true },
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: String, required: true },
        reason: { type: String },
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
