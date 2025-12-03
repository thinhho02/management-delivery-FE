'use client';

import { createContext, RefObject, useContext, useEffect, useMemo, useRef, useState } from "react";
import socketInstance from "@/apis/wsConfig";
import { useUserBusiness } from "./UserProviderBusiness";



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


const SocketContextBusiness = createContext<SocketContextState | undefined>(undefined);


export function SocketProviderBusiness({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const manualDisconnectRef = useRef(false);
    const { user } = useUserBusiness()

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
            socketInstance.emit("join:business_join", { businessId: user.account._id })
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
            socketInstance.emit("leave:business_join", { businessId: user.account._id })
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
        <SocketContextBusiness.Provider value={value}>
            {children}
        </SocketContextBusiness.Provider>
    );
}


export function useSocketBusiness() {
    const ctx = useContext(SocketContextBusiness);
    if (!ctx) {
        throw new Error("useSocket must be used inside <SocketProvider>");
    }
    return ctx;
}