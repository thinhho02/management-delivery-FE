"use client";

import { APIResponse, update } from "@/apis/apiCore";
import {
    Box,
    Button,
    CloseButton,
    Dialog,
    Portal,
    Spinner,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { LuScanQrCode } from "react-icons/lu";
import { QrReader } from "react-qr-reader";
import { KeyedMutator } from "swr";
import { IPickupOrderResponse } from "../_hooks/usePickupOrder";
import { toaster } from "@/components/ui/toaster";

const ScanDialog = ({
    officeId,
    type,
    mutate,
}: {
    officeId: string | undefined;
    type: "arrival" | "departure";
    mutate: KeyedMutator<APIResponse<IPickupOrderResponse>>;
}) => {
    const [open, setOpen] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const handleScan = async (trackingCode: string) => {
        if (!officeId) {
            toaster.error({
                title: "Thất bại",
                description: "Không tìm thấy mã bưu cục",
            });
            return;
        }

        setScanning(true);

        const res = await update<any>("/order/office/qr-scan", {
            trackingCode,
            officeId,
            eventType: type,
        });

        if (res.success) {
            toaster.success({ title: "Thành công", description: res.result.message });

            mutate(
                (prev) => {
                    if (!prev?.success) return prev;
                    const updatedOrder = res.result.order;

                    return {
                        ...prev,
                        result: {
                            ...prev.result,
                            orders: prev.result.orders.map((o) =>
                                o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o
                            ),
                        },
                    };
                },
                false
            );
        } else {
            toaster.error({ title: "Lỗi", description: res.error });
        }

        setScanning(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
            <Dialog.Trigger asChild>
                <Button variant="outline">
                    <LuScanQrCode />
                    {type === "arrival" ? "Quét mã nhập Kho" : "Quét mã xuất Kho"}
                </Button>
            </Dialog.Trigger>

            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>
                                {type === "arrival" ? "Quét mã nhập kho" : "Quét mã xuất kho"}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Box position="relative" w="100%" h="360px">
                                <QrReader
                                    onResult={(result, error) => {
                                        if (result) {
                                            const text = result.getText ? result.getText() : "";
                                            if (text) handleScan(text);
                                        }
                                    }}
                                    constraints={{
                                        facingMode: { ideal: "environment" },
                                    }}
                                    scanDelay={300}
                                    videoContainerStyle={{ width: "100%", height: "100%" }}
                                    videoStyle={{ width: "100%", height: "100%" }}
                                />
                                {scanning && (
                                    <Spinner
                                        position="absolute"
                                        top="50%"
                                        left="50%"
                                        transform="translate(-50%, -50%)"
                                    />
                                )}
                            </Box>

                            {cameraError && (
                                <Box color="red.500" mt={3} fontSize="sm">
                                    ⚠️ Không mở được camera: {cameraError}
                                    <br />
                                    • Hãy kiểm tra quyền camera trong trình duyệt.
                                    <br />
                                    • iPhone yêu cầu bạn đang dùng **HTTPS**.
                                </Box>
                            )}
                        </Dialog.Body>

                        <Dialog.CloseTrigger asChild>
                            <CloseButton />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

export default ScanDialog;
