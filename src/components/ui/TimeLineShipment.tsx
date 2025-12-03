import { ResponseDetailOrder } from "@/app/(business)/console/[orderId]/_types/responseDetailOrder";
import { formatDateVN } from "@/utils/formatDateVN";
import { Text, Timeline } from "@chakra-ui/react";
import { LuCheck, LuClock3, LuFileCheck, LuPackage, LuRotateCcw, LuShip, LuTriangleAlert, LuTruck, LuX } from "react-icons/lu";

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

const TimelineShipment = ({ order }: { order: ResponseDetailOrder }) => {
    const events = order.shipment.events || [];

    // index của trạng thái hiện tại trong timeline
    const currentIndex = events.length - 1;

    const isFailed = ["cancelled", "lost", "damaged", "delivery_attempt"].includes(
        order.shipment.currentType
    );

    return (
        <Timeline.Root size="md">

            {events.map((ev, i) => {
                const mapping = EVENT_MAP[ev.eventType];
                const Icon = mapping.icon;


                return (
                    <Timeline.Item key={i}>
                        <Timeline.Content width="90px">
                            <Timeline.Title fontSize="xs" color="gray.500">{formatDateVN(ev.timestamp)}</Timeline.Title>
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
    );
};

export default TimelineShipment;
