"use client";

import useSWR from "swr";
import { get } from "@/apis/apiCore";
import { IPostOffice, usePostInfo } from "../_providers/PostInfoProvider";
import { Box, Center, Spinner } from "@chakra-ui/react";
import { useEffect } from "react";
import { OrderStatus } from "@/app/(business)/console/tracking-order/_hooks/useBusinessOrders";
import { ShipmentEventType } from "@/components/ui/TimeLineShipment";



export type PrintedFilter = "all" | "printed" | "not_printed";

export interface IUserInfo {
    name: string;
    numberPhone: string;
    address: string;
}
export interface IRouteStep {
    from: IPostOffice;
    to: IPostOffice;
    type: "pickup" | "hub" | "sorting" | "delivery";  // step loại BC
    order: number;                                      // thứ tự step
}
interface IOrderEvent {
    eventType: ShipmentEventType;
    note: string;
    officeId: IPostOffice | null;
    shipperDetailId: any;
    proofImages: string[];
    timestamp: Date
}

export interface IPickupOrder {
    _id: string;
    orderCode: string;
    trackingCode: string;
    status: OrderStatus,
    sender: IUserInfo;
    receiver: IUserInfo;
    receiverAddress: string;

    weight: number;
    shipFee: number;

    currentType: ShipmentEventType;
    routePlan: IRouteStep[],
    events: IOrderEvent[],
    pick: "pick_home" | "pick_post";

    amountCod?: number;
    createdAt: string;
}

export interface IPickupOrderResponse {
    orders: IPickupOrder[];
    pagination: {
        page: number;
        totalPages: number;
        total: number;
    };
}


// ========================
// HOOK FETCH
// ========================
export const usePickupOrders = ({
    typeOffice,
    page,
    status,
    pick,
    postInfo
}: {
    typeOffice: "inbound" | "outbound"
    page: number;
    status: string;
    pick: string;
    postInfo: IPostOffice
}) => {
    const query = !postInfo._id ? null : `/order/${postInfo.type}/${postInfo._id}/${typeOffice}?status=${status || ""}&pick=${pick || ""}&page=${page || ""}`;

    const { data, error, isLoading, isValidating, mutate } = useSWR(
        query,
        get<IPickupOrderResponse>,
        { revalidateOnFocus: false }
    );

    // useEffect(()=>{
    //     if(!data || !)
    // },[data])

    const orders = data && data?.success ? data.result.orders : undefined

    return {
        data: orders,
        pagination: data?.success ? data.result.pagination : null,
        loading: isLoading || isValidating,
        error,
        mutate,
        postId: postInfo._id || undefined
    };
};
