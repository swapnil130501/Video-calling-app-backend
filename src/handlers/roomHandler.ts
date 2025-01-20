import { Socket } from "socket.io";
import { v4 as UUIDv4 } from "uuid";

const roomHandler = (socket: Socket) => {

    const createRoom = () => {
        const roomId = UUIDv4(); // create an unique room Id
        socket.join(roomId); // create a socket connection for the room
        socket.emit("room-created", { roomId }); // emit an event from server side
        console.log("Room created with id:", roomId);
    };

    const joinRoom = () => {
        console.log("New room joined");
    };

    socket.on('create-room', createRoom);
    socket.on('join-room', joinRoom);
};

export default roomHandler;