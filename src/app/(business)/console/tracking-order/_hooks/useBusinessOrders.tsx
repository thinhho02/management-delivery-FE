"use client";

import useSWR from "swr";
import { get } from "@/apis/apiCore";

export type OrderStatus = "pending" | "in_transit" | "delivered" | "cancelled";
export type PrintedFilter = "all" | "printed" | "not_printed";

export interface IOrderOffice {
  _id: string;
  name: string;
  code: string;
  address: string;
}

export interface IOrder {
  _id: string;
  orderCode: string;
  trackingCode: string;
  shipFee: number;
  status: OrderStatus;
  printed: boolean;

  pickupOffice: IOrderOffice | null;
  deliveryOffice: IOrderOffice | null;
}

export interface IOrderResponse {
  orders: IOrder[],
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  }
}



export const useBusinessOrders = ({ page, status, printed }: { page: number, status: string, printed: string }) => {

  const query = `/order/business?status=${status}&printed=${printed}&page=${page}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR(query, get<IOrderResponse>, {
    revalidateOnFocus: false,
  });
  console.log(error)
  const orders = data && data?.success ? data.result.orders : undefined // Trả về undefined nếu chưa có
  return {
    data: orders,
    pagination: data?.success ? data?.result.pagination : null,
    loading: isLoading || isValidating,
    error,
    mutate,
  };
};