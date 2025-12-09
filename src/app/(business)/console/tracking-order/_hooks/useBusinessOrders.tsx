"use client";

import useSWR from "swr";
import { get } from "@/apis/apiCore";
import { IUserInfo } from "@/app/(internal)/staff-office/_hooks/usePickupOrder";
import { ShipmentEventType } from "@/components/ui/TimeLineShipment";

export type OrderStatus = "pending" | "in_transit" | "delivered" | "cancelled";
export type PrintedFilter = "all" | "printed" | "not_printed";

export interface IOrderOffice {
  _id: string;
  name: string;
  code: string;
  address: string;
}

export interface IShipperDetail {
  _id: string;
  employeeId: IUserInfo
}

export interface IEventType {
  eventType: ShipmentEventType,
  note: string,
  timestamp: string,
  officeId: IOrderOffice,

  shipperDetailId: IShipperDetail,

}

export interface IOrder {
  _id: string;
  orderCode: string;
  trackingCode: string;
  shipFee: number;
  status: OrderStatus;
  printed: boolean;
  pick: "pick_home" | "pick_post",
  pickupOffice: IOrderOffice | null;
  deliveryOffice: IOrderOffice | null;
  customer: IUserInfo,
  events: IEventType[]
}

export interface IOrderResponse {
  orders: IOrder[],
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  }
}



export const useBusinessOrders = ({ page, pick, status, printed }: { page: number, pick?: string, status?: string, printed?: string }) => {

  const query = `/order/business?status=${status || ""}&printed=${printed || ""}&page=${page}&pick=${pick || ""}`;
  
  const { data, error, isLoading, isValidating, mutate } = useSWR(query, get<IOrderResponse>, {
    revalidateOnFocus: false,
  });
  const orders = data && data?.success ? data.result.orders : undefined // Trả về undefined nếu chưa có
  return {
    data: orders,
    pagination: data?.success ? data?.result.pagination : null,
    loading: isLoading || isValidating,
    error,
    mutate,
  };
};