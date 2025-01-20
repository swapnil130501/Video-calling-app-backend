import { Socket } from "socket.io";
import { v4 as UUIDv4 } from "uuid";
import IRoomParams from "../interfaces/IRoomParams";

const rooms: Record<string, string[]> = {};

const roomHandler = (socket: Socket) => {

    const createRoom = () => {
        const roomId = UUIDv4(); // create an unique room Id
        socket.join(roomId); // create a socket connection for the room

        rooms[roomId] = [];

        socket.emit("room-created", { roomId }); // emit an event from server side
        console.log("Room created with id:", roomId);
    };

    const joinedRoom = ({ roomId, peerId }: IRoomParams) => {
        if(rooms[roomId]) {
            console.log("New user has joined the room", roomId, "with peer id as", peerId);
            rooms[roomId].push(peerId);
            socket.join(roomId);
        }
    };

    socket.on('create-room', createRoom);
    socket.on('joined-room', joinedRoom);
};

export default roomHandler;