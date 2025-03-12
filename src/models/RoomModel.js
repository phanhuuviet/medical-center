import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema(
    {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: true,
        collection: 'Room',
    },
);

const RoomModel = mongoose.model('Room', RoomSchema);
export default RoomModel;
