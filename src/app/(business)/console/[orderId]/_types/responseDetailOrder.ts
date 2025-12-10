import { ShipmentEventType } from "@/components/ui/TimeLineShipment";
import { IEventType, IOrderOffice } from "../../tracking-order/_hooks/useBusinessOrders";
import { IRouteStep } from "@/app/(internal)/staff-office/_hooks/usePickupOrder";

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

// export interface IOrderEvent {
//   eventType: ShipmentEventType;      // tên sự kiện: "Đã tạo đơn", "Đã nhận hàng", ...
//   note: string;
//   timestamp: Date | string;
//   officeId?: IOrderOffice;  // tên bưu cục
//   officeName?: string,
//   officeAddress?: string,
//   officeLocation?: string,
//   shipperId?: string,
//   shipperName?: string,
//   shipperNumberPhone?: string,
//   proofImages: string[]
// }

export interface IShipmentDetail {
  trackingCode?: string;
  pickupOffice: IOrderOffice;      // bạn có thể tạo interface riêng IPostOffice nếu muốn strict hơn
  deliveryOffice: IOrderOffice;
  currentType: ShipmentEventType;
  events: IEventType[];
}

export interface ResponseDetailOrder {
  _id: string;
  orderCode: string;
  status: string;         // "pending" | "in_transit" | "delivered" | ...
  shipFee: number;
  cod: boolean;
  routePlan: IRouteStep[],
  amountCod: number;
  createdAt: Date | string;

  seller: IOrderPerson;
  customer: IOrderPerson;

  shipment: IShipmentDetail;
}