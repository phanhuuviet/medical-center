import { Server } from 'socket.io';

import { SOCKET_MESSAGE } from '../constants/socket-message.js';
import RoomModel from '../models/RoomModel.js';

const configurationSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
        },
    });

    // JOIN_ROOM
    io.on(SOCKET_MESSAGE.CONNECTION, (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on(SOCKET_MESSAGE.JOIN_ROOM, async ({ senderId, receiverId }) => {
            let room = await RoomModel.findOne({
                $or: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ],
            });

            if (!room) {
                room = await RoomModel.create({ senderId, receiverId });
            }

            socket.join(room._id.toString());
            socket.emit(SOCKET_MESSAGE.JOINED_ROOM, room._id);
        });

        // DISCONNECT
        socket.on(SOCKET_MESSAGE.DISCONNECT, () => {
            console.log('User disconnected');
        });
    });
};

export default configurationSocket;
