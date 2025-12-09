'use client'

import socketInstance from '@/apis/wsConfig'
import { useEffect, useState } from 'react'

const useSocket = () => {
    const [isConnected, setIsConnected] = useState<boolean>(false)
    useEffect(() => {
        if (socketInstance.connected) {
            console.log(socketInstance.id)
            setIsConnected(true)
        }

        socketInstance.on("connect_error", (error) => {
            if (socketInstance.active) {
                // temporary failure, the socket will automatically try to reconnect
            } else {
                // the connection was denied by the server
                // in that case, `socket.connect()` must be manually called in order to reconnect
                console.log(error.message);
            }
        });

        socketInstance.on("disconnect", (reason) => {
            console.log(reason)
            setIsConnected(false)
        })
        socketInstance.on("error", (payload: string) => {
            console.log(payload)
            setIsConnected(false)
        });
        return () => {
            socketInstance.off("disconnect")
            socketInstance.off("error")
        }
    }, [])
    return { isConnected, setIsConnected }
}

// export default useSocket