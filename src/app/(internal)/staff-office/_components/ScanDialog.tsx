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
import React, { useEffect, useRef, useState } from "react";
import { LuScanQrCode } from "react-icons/lu";
import { QrReader } from "react-qr-reader";
import { KeyedMutator } from "swr";
import { IPickupOrderResponse } from "../_hooks/usePickupOrder";
import { toaster } from "@/components/ui/toaster";
import { Html5QrcodeScanner } from "html5-qrcode";

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
    const [loadingScan, setLoadingScan] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const containerId = "qr-reader-container";

    const startScanner = () => {
        if (scannerRef.current) return;

        const scanner = new Html5QrcodeScanner(
            containerId,
            {
                fps: 5,
                qrbox: { width: 250, height: 250 },
                rememberLastUsedCamera: true
            },
            false
        );

        scannerRef.current = scanner;

        scanner.render(
            async (result: string) => {
                console.log("QR Scanned:", result);
                scanner.clear();
                scannerRef.current = null;
                await handleScan(result);
            },
            (err: any) => {
                console.log("QR error:", err);
            }
        );
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear();
            scannerRef.current = null;
        }
    };

    useEffect(() => {
        if (open) startScanner();
        else stopScanner();

        return () => stopScanner();
    }, [open]);

    const handleScan = async (trackingCode: string) => {
        if (!officeId) {
            toaster.error({ title: "Lỗi", description: "Không tìm thấy mã bưu cục" });
            return;
        }

        setLoadingScan(true);

        const res = await update<any>("/order/office/qr-scan", {
            trackingCode,
            officeId,
            eventType: type,
        });

        if (res.success) {
            toaster.success({
                title: "Thành công",
                description: res.result.message,
            });

            // Update danh sách đơn hàng
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

        setLoadingScan(false);
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
                            <Box id={containerId} w="100%" minH="300px" />

                            {loadingScan && (
                                <Spinner
                                    size="lg"
                                    position="absolute"
                                    top="50%"
                                    left="50%"
                                    transform="translate(-50%, -50%)"
                                />
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
