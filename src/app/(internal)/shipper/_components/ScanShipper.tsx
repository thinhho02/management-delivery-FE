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
import { KeyedMutator } from "swr";
import { toaster } from "@/components/ui/toaster";
import { Html5Qrcode } from "html5-qrcode";
import { playSound } from "@/utils/sound";

const ScanShipper = ({
    type,
    shipperId
}: {
    type: "pickup" | "delivered";
    shipperId: string
}) => {
    const [open, setOpen] = useState(false);
    const [loadingScan, setLoadingScan] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const processingRef = useRef(false);
    const lastScanRef = useRef(0);
    const SCAN_DELAY = 1000;
    const containerId = "qr-reader-container";

    const startScanner = async () => {
        if (scannerRef.current) return;

        const scanner = new Html5Qrcode(containerId);

        scannerRef.current = scanner;
        processingRef.current = false;

        await scannerRef.current.start({ facingMode: "environment" }, {
            fps: 10,
            qrbox: { width: 250, height: 250 },

        },
            async (result: string) => {
                const now = Date.now();

                // Không scan nếu chưa đủ delay 1 giây
                if (now - lastScanRef.current < SCAN_DELAY) return;
                lastScanRef.current = now;

                // CHẶN ĐANG SCAN LẦN TRƯỚC CHƯA XONG
                if (processingRef.current) return;
                processingRef.current = true;

                console.log("QR Scanned:", result);
                await handleScan(result);

                processingRef.current = false;
            },
            (err: any) => {
                console.log("QR error:", err);
            }
        );
    };

    useEffect(() => {
        setTimeout(() => {
            if (open) {
                startScanner()
            }
        }, 1000)

        return () => {
            const stop = async () => {
                if (scannerRef.current) {
                    await scannerRef.current.stop()
                    scannerRef.current.clear();
                    scannerRef.current = null;
                }
            }
            stop()
        };;
    }, [open]);

    const handleScan = async (trackingCode: string) => {
        if (!shipperId) {
            toaster.error({ title: "Lỗi", description: "Không tìm thấy shipper" });
            return;
        }

        setLoadingScan(true);

        const res = await update<any>(`/order/shipper/qr-scan-${type}`, {
            trackingCode,
            shipperId,
            eventType: type,
        });

        if (res.success) {
            toaster.success({
                id: "success-scan",
                title: "Thành công",
                description: res.result.message,
            });

            // Update danh sách đơn hàng
            // mutate(
            //     (prev) => {
            //         if (!prev?.success) return prev;
            //         const updatedOrder = res.result.order;

            //         return {
            //             ...prev,
            //             result: {
            //                 ...prev.result,
            //                 orders: prev.result.orders.map((o) =>
            //                     o._id === updatedOrder._id ? { ...o, currentType: updatedOrder.shipment.currentType } : o
            //                 ),
            //             },
            //         };
            //     },
            //     false
            // );
            playSound('/sound/success-scan.mp3')
        } else {
            toaster.error({ id: "error-scan", title: "Lỗi", description: res.error });
            playSound('/sound/error-scan.mp3')
        }

        setLoadingScan(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
            <Dialog.Trigger asChild>
                <Button variant="outline" size={'sm'}>
                    <LuScanQrCode />
                    {type === "pickup" ? "Quét mã lấy hàng" : "Quét mã giao hàng"}
                </Button>
            </Dialog.Trigger>

            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>
                                {type === "pickup" ? "Quét mã lấy hàng" : "Quét mã giao hàng"}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Box id={containerId} w="100%" minH="400px" border={'none'} />

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

export default ScanShipper;
