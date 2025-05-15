import mongoose from 'mongoose';

const HistoryLogSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        action: { type: String, required: true }, // type of action (create, update, delete)
        details: { type: String, required: true },
        updatedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        entity: { type: String, required: true }, // type of entity (user, appointment, etc.)
        entityId: { type: mongoose.Schema.Types.ObjectId, required: true }, // id of the entity being modified
    },
    {
        timestamps: true,
        collection: 'HistoryLog',
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    },
);

HistoryLogSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});

HistoryLogSchema.virtual('updatedByUser', {
    ref: 'User',
    localField: 'updatedByUserId',
    foreignField: '_id',
    justOne: true,
});

const HistoryLogModel = mongoose.model('HistoryLog', HistoryLogSchema);
export default HistoryLogModel;
