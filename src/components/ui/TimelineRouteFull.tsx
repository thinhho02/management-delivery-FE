"use client";

import {
  Box,
  Grid,
  GridItem,
  HStack,
  VStack,
  Text,
  Timeline,
} from "@chakra-ui/react";
import {
  LuMapPin,
  LuWarehouse,
  LuPackage,
  LuTruck,
  LuCheck,
  LuFileCheck,
  LuClock3,
  LuPackageCheck,
  LuTriangleAlert,
  LuRotateCcw,
  LuX,
  LuShip,
} from "react-icons/lu";

import { formatDateVN } from "@/utils/formatDateVN";
import { IPickupOrder } from "@/app/(internal)/staff-office/_hooks/usePickupOrder";


// ========= ICON MAP ==========
const ROUTE_ICON: Record<string, any> = {
  pickup: LuMapPin,
  hub: LuWarehouse,
  sorting: LuPackage,
  delivery: LuTruck,
};

// ========= EVENT MAP =========
const EVENT_ICON: Record<string, any> = {
  created: LuFileCheck,
  waiting_pickup: LuClock3,
  pickup: LuPackageCheck,
  arrival: LuPackage,
  departure: LuTruck,
  delivery_attempt: LuTriangleAlert,
  delivered: LuCheck,
  returned: LuRotateCcw,
  cancelled: LuX,
  lost: LuX,
  damaged: LuX,
};

export type ShipmentEventType =
  'created'
  | 'waiting_pickup'
  | 'pickup'
  | 'arrival'
  | 'departure'
  | 'delivery_attempt'
  | 'delivered'
  | 'returned'
  | 'cancelled'
  | 'lost'
  | 'damaged'


export const EVENT_MAP: Record<
  ShipmentEventType,
  { label: string; icon: any }
> = {
  created: { label: "Tạo đơn hàng thành công", icon: LuFileCheck },
  waiting_pickup: { label: "Đơn hàng đang chuẩn bị", icon: LuClock3 },
  pickup: { label: "Đã lấy hàng", icon: LuShip },
  arrival: { label: "Đến bưu cục", icon: LuPackage },
  departure: { label: "Rời bưu cục", icon: LuTruck },
  delivery_attempt: { label: "Giao hàng thất bại", icon: LuTriangleAlert },
  delivered: { label: "Đã giao hàng", icon: LuCheck },
  returned: { label: "Đang hoàn hàng", icon: LuRotateCcw },
  cancelled: { label: "Đã hủy", icon: LuX },
  lost: { label: "Thất lạc", icon: LuX },
  damaged: { label: "Hư hỏng", icon: LuX },
};


// ========= COMPONENT ==========
export default function TimelineRouteFull({
  order,
}: {
  order: IPickupOrder;
}) {
  const routePlan = order.routePlan || [];
  const events = order.events || [];

  // Xác định step active dựa vào event thực tế
  const activeOrder = getActiveRouteStep(routePlan, events);

  const currentIndex = events.length - 1;

  const isFailed = ["cancelled", "lost", "damaged", "delivery_attempt"].includes(
    order.currentType
  );

  return (
    <Grid
      // grid-template-rows: repeat(auto-fit, minmax(330px, 1fr));
      gridTemplateColumns={{
        base: "repeat(auto-fit, minmax(320px, 1fr))",
        md: "repeat(auto-fit, minmax(420px, 1fr))"
      }}
      gap={{
        base: "60px",
        md: 0
      }}
      p={4}
      w={'full'}
      divideX={'1px'} >
      {/* ========================== */}
      {/*       ROUTE PLAN LEFT      */}
      {/* ========================== */}
      <GridItem pr={{ base: 0, md: 10 }}>
        <Text fontSize="lg" fontWeight="bold" mb={3}>
          HÀNH TRÌNH DỰ KIẾN
        </Text>


        <Timeline.Root size="sm">
          {routePlan.map((step) => {
            const Icon = ROUTE_ICON[step.type];
            const isActive = step.order === activeOrder;

            return (
              <Timeline.Item key={step.order}>
                <Timeline.Content width="80px">
                  <Timeline.Title fontSize="xs" color="gray.500">
                    Bước {step.order}
                  </Timeline.Title>
                </Timeline.Content>

                <Timeline.Connector>
                  <Timeline.Separator />
                  <Timeline.Indicator
                    colorPalette={isActive ? "blue" : "gray"}
                    borderWidth={isActive ? "2px" : "1px"}
                  >
                    <Icon />
                  </Timeline.Indicator>
                </Timeline.Connector>

                <Timeline.Content>
                  <Timeline.Title mt={0} color={isActive ? "blue.600" : ""}>
                    {step.from?.name} ➜ {step.to?.name}
                  </Timeline.Title>
                  <Text fontSize="xs" color="gray.600">
                    Loại: {step.type.toUpperCase()}
                  </Text>
                </Timeline.Content>
              </Timeline.Item>
            );
          })}
        </Timeline.Root>
      </GridItem>



      {/* ========================== */}
      {/*     SHIPMENT EVENTS RIGHT  */}
      {/* ========================== */}
      <GridItem pl={{ base: 0, md: 10 }}>
        <Text fontSize="lg" fontWeight="bold" mb={3}>
          HÀNH TRÌNH THỰC TẾ
        </Text>

        <Timeline.Root size="md">
          {events.map((ev, i) => {
            const mapping = EVENT_MAP[ev.eventType];
            const Icon = mapping.icon;

            return (
              <Timeline.Item key={i}>
                <Timeline.Content width="90px">
                  <Timeline.Title fontSize="xs" color="gray.500">
                    {formatDateVN(ev.timestamp)}
                  </Timeline.Title>
                </Timeline.Content>

                <Timeline.Connector>
                  <Timeline.Separator />
                  <Timeline.Indicator
                    colorPalette={isFailed && i === currentIndex ? "red" : "green"}
                  >
                    <Icon />
                  </Timeline.Indicator>
                </Timeline.Connector>

                {/* Nội dung */}
                <Timeline.Content>
                  <Timeline.Title mt={0}>
                    {mapping.label}
                  </Timeline.Title>

                  {/* Địa chỉ bưu cục */}
                  <Timeline.Description fontSize="xs">
                    {ev.officeId?.name || ""}
                  </Timeline.Description>

                  {/* Note nếu có */}
                  {ev.note && (
                    <Text textStyle="sm" color="orange.600">
                      {ev.note}
                    </Text>
                  )}
                </Timeline.Content>
              </Timeline.Item>
            );
          })}
        </Timeline.Root>
      </GridItem>
    </Grid >
  );
}



// =========  MATCH ROUTE WITH EVENTS  =========
function getActiveRouteStep(routePlan: any[], events: any[]) {
  if (!routePlan.length || !events.length) return null;

  const lastEvent = events[events.length - 1];

  // Nếu event có officeId -> xác định step
  if (lastEvent.officeId?._id) {
    const officeId = lastEvent.officeId._id.toString();

    const route = routePlan.find(
      (step) =>
        step.from?._id?.toString() === officeId ||
        step.to?._id?.toString() === officeId
    );

    return route?.order || null;
  }

  return null;
}
