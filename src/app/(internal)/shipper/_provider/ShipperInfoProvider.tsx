'use client'

import { createContext, useContext, useEffect, useMemo } from "react";
import useSWR from "swr";
import { useUserInternal } from "../../_providers/UserProviderInternal";
import { get } from "@/apis/apiCore";
import { notFound } from "next/navigation";
import { useSocketInternal } from "../../_providers/SocketProviderInternal";
import { IPostOffice } from "../../staff-office/_providers/PostInfoProvider";
import { Point } from "geojson";
import { updateShipperLocation } from "../_utils/locationShipper";



export interface IEmployee {
    _id: string;
    name: string;
    email: string;
    numberPhone: string;
}


export interface IShipper {
    _id: string;
    shipperZoneId: string | null;
    employeeId: IEmployee | null;
    vehicleType: "bike" | "truck" | null;
    status: boolean;
    location: Point | null
}

const PostOfficePending: IPostOffice = {
    _id: "",
    name: "Đang tải bưu cục...",
    code: "",
    type: "delivery_office",
    address: "",
    status: false,
    regionId: null,
    provinceId: null,
    wardId: null,
    parentId: null
};

const ShipperPending: IShipper = {
    _id: "",
    shipperZoneId: null,
    employeeId: null,
    vehicleType: null,
    status: false,
    location: null
}

export interface ShipperInfoContextType {
    post: IPostOffice;
    shipper: IShipper;
}

const ShipperInfoContext = createContext<ShipperInfoContextType>({
    post: PostOfficePending,
    shipper: ShipperPending
});


const ShipperInfoProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUserInternal()
    const { isConnected, emitEvent } = useSocketInternal()
    const { data, isLoading, mutate } = useSWR(
        `/shipper/employee`,
        get<IShipper>,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            revalidateOnMount: true
        }
    );
    if (data && !data.success) {
        notFound();
    }

    useEffect(() => {
        if (!data || !data.success || !isConnected) return;

        emitEvent("join:shipper_join", { shipperId: data.result._id })

        return () => {
            emitEvent("leave:shipper_join", { shipperId: data.result._id })
        }
    }, [data, isConnected])

    useEffect(() => {
        if (!data?.success || !isConnected) return;

        const shipperId = data.result._id;

        // ✅ Update ngay khi login
        updateShipperLocation(shipperId);

        // 🔁 Update mỗi 5 phút
        const interval = setInterval(() => {
            updateShipperLocation(shipperId);
        }, 5 * 60 * 1000);

        return () => {
            clearInterval(interval);
        };
    }, [data, isConnected]);
    

    const post: IPostOffice = user.account.officeId

    const value = useMemo<ShipperInfoContextType>(() => ({
        shipper: data?.success ? data.result : ShipperPending,
        post
    }), [data, post]);

    return (
        <ShipperInfoContext.Provider value={value}>
            {children}
        </ShipperInfoContext.Provider>
    )
}

export function useShipperInfo() {
    const u = useContext(ShipperInfoContext)
    if (!u) {
        throw new Error("UserContext must be used inside <UserProviderInternal>");
    }
    return u;
}

export default ShipperInfoProvider