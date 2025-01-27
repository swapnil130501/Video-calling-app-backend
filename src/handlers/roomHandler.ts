import { Socket } from "socket.io";
import { v4 as UUIDv4 } from "uuid";
import IRoomParams from "../interfaces/IRoomParams";

const rooms: Record<string, string[]> = {};

const roomHandler = (socket: Socket) => {
    const createRoom = () => {
        const roomId = UUIDv4();
        socket.join(roomId);
        rooms[roomId] = [];
        socket.emit("room-created", { roomId });
        console.log("Room created with id:", roomId);
    };

    const joinedRoom = ({ roomId, peerId }: IRoomParams) => {
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

    const sendMessage = ({ roomId, peerId, message}: IRoomParams) => {
        if(!roomId || !peerId || !message) {
            socket.emit("error", { message: "Invalid room, peer ID or message." });
            return;
        }

        console.log("Message recieved from peer:", peerId, message)
        socket.to(roomId).emit("new-message", { peerId, message });
    }

    socket.on("disconnect", () => {
        for (const [roomId, participants] of Object.entries(rooms)) {
            const index = participants.indexOf(socket.id);
            if (index > -1) {
                participants.splice(index, 1);
                console.log(`Peer ${socket.id} left room ${roomId}`);
                if (participants.length === 0) {
                    delete rooms[roomId];
                    console.log(`Room ${roomId} deleted.`);
                } else {
                    socket.to(roomId).emit("user-left", { peerId: socket.id });
                }
            }
        }
    });

    socket.on("create-room", createRoom);
    socket.on("joined-room", joinedRoom);
    socket.on("send-message", sendMessage);
};

export default roomHandler;
