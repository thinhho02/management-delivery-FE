'use client'

import { createContext, RefObject, useContext, useEffect, useMemo, useRef, useState } from "react";
import socketInstance from "@/apis/wsConfig";
import { useUserInternal } from "./UserProviderInternal";


interface SocketContextState {
    isConnected: boolean;
    socket: typeof socketInstance;
    manualDisconnectRef: RefObject<boolean>;
    joinRoom: (nameEvent: string, roomId: string) => void;
    leaveRoom: (nameEvent: string, roomId: string) => void;
    emitEvent: (nameEvent: string, payload?: any) => void;
    disconnect: () => void;
    disconnectManually: () => void;
    reconnect: () => void;
}

const SocketContextInternal = createContext<SocketContextState | undefined>(undefined);

export const SocketProviderInternal = ({ children }: { children: React.ReactNode }) => {
    const [isConnected, setIsConnected] = useState(false);
    const manualDisconnectRef = useRef(false);
    const { user } = useUserInternal()

    // Setup listeners ONE TIME only
    useEffect(() => {
        // chỉ kết nối 1 lần
        if (!socketInstance.connected) {
            socketInstance.connect();
        }

        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance.id);
            console.log(user)
            socketInstance.emit("join:room_session", { sessionId: user.sid })
            setIsConnected(true);
        });

        socketInstance.on("disconnect", (reason) => {
            console.log("Disconnect:", reason);
            setIsConnected(false);
        });

        socketInstance.on("connect_error", (err) => {
            console.log("Connect error:", err.message);
        });


        return () => {
            socketInstance.off("connect");
            socketInstance.off("disconnect");
            socketInstance.off("connect_error");
        };
    }, []);

    // các hàm utilities cho frontend gọi
    const joinRoom = (nameEvent: string, roomId: string) => {
        if (socketInstance.connected) {
            socketInstance.emit(nameEvent, roomId);
        }
    };

    const leaveRoom = (nameEvent: string, roomId: string) => {
        if (socketInstance.connected) {
            socketInstance.emit(nameEvent, roomId);
        }
    };

    const emitEvent = (nameEvent: string, payload?: any) => {
        socketInstance.emit(nameEvent, payload);
    };

    const disconnect = () => {
        socketInstance.disconnect();
    };
    const reconnect = () => {
        if (!socketInstance.connected) {
            socketInstance.connect();
        }
    };

    const disconnectManually = () => {
        manualDisconnectRef.current = true;
        socketInstance.disconnect();

        setTimeout(() => {
            manualDisconnectRef.current = false;
        }, 200);
    };



    const value = useMemo(
        () => ({
            isConnected,
            socket: socketInstance,
            manualDisconnectRef,
            joinRoom,
            leaveRoom,
            emitEvent,
            disconnect,
            disconnectManually,
            reconnect
        }),
        [isConnected]
    );


    return (
         <SocketContextInternal.Provider value={value}>
            {children}
        </SocketContextInternal.Provider>
    )
}


export function useSocketInternal() {
    const ctx = useContext(SocketContextInternal);
    if (!ctx) {
        throw new Error("useSocket must be used inside <SocketProviderInternal>");
    }
    return ctx;
}
