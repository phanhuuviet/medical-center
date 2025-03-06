import mongoose from 'mongoose';

const HealthRecordSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        bloodType: { type: String, default: null },
        height: { type: Number, default: null },
        weight: { type: Number, default: null },
        healthHistory: { type: String, default: null },
    },
    {
        timestamps: true,
        collection: 'HealthRecord',
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    },
);

HealthRecordSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});

const HealthRecordModel = mongoose.model('HealthRecord', HealthRecordSchema);
export default HealthRecordModel;
