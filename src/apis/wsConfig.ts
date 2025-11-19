import { io } from 'socket.io-client'


const originBackend = process.env.NEXT_PUBLIC_ORIGIN_PATH_BACKEND

const socketInstance = io(originBackend, {
    autoConnect: false,
    transports: ["websocket"], // tối ưu
});

export default socketInstance
