"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const rooms = {};
const roomHandler = (socket) => {
    const createRoom = () => {
        const roomId = (0, uuid_1.v4)();
        socket.join(roomId);
        rooms[roomId] = [];
        socket.emit("room-created", { roomId });
        console.log("Room created with id:", roomId);
    };
    const joinedRoom = ({ roomId, peerId }) => {
        if (!roomId || !peerId) {
            socket.emit("error", { message: "Invalid room or peer ID." });
            return;
        }
        if (!rooms[roomId]) {
            socket.emit("error", { message: "Room does not exist." });
            return;
        }
        if (rooms[roomId].includes(peerId)) {
            socket.emit("error", { message: "You are already in the room." });
            return;
        }
        console.log("New user joining room:", roomId, "with peer ID:", peerId);
        rooms[roomId].push(peerId);
        socket.join(roomId);
        // Immediately emit the user-joined event to others in the room
        socket.to(roomId).emit("user-joined", { peerId });
        // Emit the participants list to the joining user
        socket.emit("get-users", { roomId, participants: rooms[roomId] });
    };
    socket.on("disconnect", () => {
        for (const [roomId, participants] of Object.entries(rooms)) {
            const index = participants.indexOf(socket.id);
            if (index > -1) {
                participants.splice(index, 1);
                console.log(`Peer ${socket.id} left room ${roomId}`);
                if (participants.length === 0) {
                    delete rooms[roomId];
                    console.log(`Room ${roomId} deleted.`);
                }
                else {
                    socket.to(roomId).emit("user-left", { peerId: socket.id });
                }
            }
        }
    });
    socket.on("create-room", createRoom);
    socket.on("joined-room", joinedRoom);
};
exports.default = roomHandler;
