import { ShipmentEventType } from "@/components/ui/TimeLineShipment";
import { IOrderOffice } from "../../tracking-order/_hooks/useBusinessOrders";

export interface IUserLocation {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface IOrderPerson {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  location?: IUserLocation;
}

export interface IOrderEvent {
  eventType: ShipmentEventType;      // tên sự kiện: "Đã tạo đơn", "Đã nhận hàng", ...
  note: string;
  timestamp: Date | string;
  officeId: IOrderOffice | null;  // tên bưu cục
  officeAddress: string | null;
}

export interface IShipmentDetail {
  trackingCode?: string;
  pickupOffice: any | null;      // bạn có thể tạo interface riêng IPostOffice nếu muốn strict hơn
  deliveryOffice: any | null;
  currentType: string;
  events: IOrderEvent[];
}

export interface ResponseDetailOrder {
  _id: string;
  orderCode: string;
  status: string;         // "pending" | "in_transit" | "delivered" | ...
  shipFee: number;
  cod: boolean;
  amountCod: number;
  createdAt: Date | string;

  seller: IOrderPerson;
  customer: IOrderPerson;

  shipment: IShipmentDetail;
}