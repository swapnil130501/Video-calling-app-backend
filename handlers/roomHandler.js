"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const rooms = {};
const roomHandler = (socket) => {
    const createRoom = () => {
        const roomId = (0, uuid_1.v4)(); // create an unique room Id
        socket.join(roomId); // create a socket connection for the room
        rooms[roomId] = [];
        socket.emit("room-created", { roomId }); // emit an event from server side
        console.log("Room created with id:", roomId);
    };
    const joinedRoom = ({ roomId, peerId }) => {
        if (rooms[roomId]) {
            console.log("New user has joined the room", roomId, "with peer id as", peerId);
            rooms[roomId].push(peerId);
            socket.join(roomId);
        }
    };
    socket.on('create-room', createRoom);
    socket.on('joined-room', joinedRoom);
};
exports.default = roomHandler;
