'use client'

import { createContext, useContext, useEffect, useMemo } from "react";
import useSWR from "swr";
import { useUserInternal } from "../../_providers/UserProviderInternal";
import { get } from "@/apis/apiCore";
import { notFound } from "next/navigation";
import { useSocketInternal } from "../../_providers/SocketProviderInternal";

export interface IZoneInfo {
    _id: string;
    name: string;
    code: string;
}

export interface IParentPost {
    _id: string;
    name: string;
    code: string;
    address: string;
    type: "sorting_center" | "distribution_hub" | "delivery_office";
}

export interface IPostOffice {
    _id: string;
    name: string;
    code: string;
    type: "sorting_center" | "distribution_hub" | "delivery_office";
    address: string;
    status: boolean;
    regionId?: IZoneInfo | null;
    provinceId?: IZoneInfo | null;
    wardId?: IZoneInfo | null;
    parentId: IParentPost | null
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

export interface PostOfficeContextType {
    data: IPostOffice;
    isLoading: boolean;
}

const PostInfoContext = createContext<PostOfficeContextType>({
    data: PostOfficePending,
    isLoading: true,
});
const ShipperInfoProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUserInternal()
    const { isConnected, emitEvent } = useSocketInternal()
    const { data, isLoading } = useSWR(
        `/post-office/${user.account.officeId}`,
        get<IPostOffice>,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            revalidateOnMount: true
        }
    );
    if (!isLoading && data && !data.success) {
        notFound();
    }

    useEffect(() => {
        if (!data || !data.success || !isConnected) return;

        emitEvent("join:shipper_join", { shipperId: user.account._id })

        return () => {
            emitEvent("leave:shipper_join", { postId: user.account._id })
        }
    }, [data, isConnected])
    const finalValue: PostOfficeContextType = {
        data: data && data.success ? data.result : PostOfficePending,
        isLoading: isLoading || !data,
    };

    return (
        <PostInfoContext.Provider value={finalValue}>
            {children}
        </PostInfoContext.Provider>
    )
}

export function useShipperInfo() {
    const u = useContext(PostInfoContext)
    if (!u) {
        throw new Error("UserContext must be used inside <UserProviderInternal>");
    }
    return u;
}

export default ShipperInfoProvider