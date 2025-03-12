import mongoose from 'mongoose';

import { MESSAGE_TYPE } from '../constants';

const MessageSchema = new mongoose.Schema(
    {
        roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        type: { type: Number, default: MESSAGE_TYPE.TEXT },
    },
    {
        timestamps: true,
        collection: 'Message',
    },
);

const MessageModel = mongoose.model('Message', MessageSchema);
export default MessageModel;
