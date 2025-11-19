import { io } from 'socket.io-client'
import { originBackend } from './httpConfig';

const socketInstance = io(originBackend, {
    autoConnect: false,
    transports: ["websocket"], // tối ưu
});

export default socketInstance
