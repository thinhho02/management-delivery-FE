'use client'

import { APIResponse, update } from '@/apis/apiCore';
import { Box, Button, CloseButton, Dialog, Portal, Spinner } from '@chakra-ui/react'
import React, { useState } from 'react'
import { LuScanQrCode } from 'react-icons/lu';
import { QrReader } from "react-qr-reader";
import { KeyedMutator } from 'swr';
import { IPickupOrderResponse } from '../_hooks/usePickupOrder';
import { toaster } from '@/components/ui/toaster';

const ScanDialog = ({
    officeId,
    type, // "arrival" | "departure"
    mutate,
}: {
    officeId: string | undefined;
    type: "arrival" | "departure";
    mutate: KeyedMutator<APIResponse<IPickupOrderResponse>>
}) => {

    const [open, setOpen] = useState(false)
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleScan = async (trackingCode: string, type: "arrival" | "departure") => {
        if(!officeId){
            toaster.error({
                id: `Scan-Error-${Date.now}`,
                title: "Thất bại",
                description: "Không tìm thấy mã bưu cục"
            })
        }
        setScanning(true)
        toaster.dismiss()
        const res = await update<any>("/order/office/qr-scan", { trackingCode, officeId, eventType: type });

        if (res.success) {
            toaster.success({ title: "Thành công", description: res.result.message });
            mutate(prev => {
                if (!prev?.success) return prev;

                const updatedOrder = res.result.order;

                return {
                    ...prev,
                    result: {
                        ...prev.result,
                        orders: prev.result.orders.map(o =>
                            o._id === updatedOrder.id
                                ? { ...o, ...updatedOrder }
                                : o
                        )
                    }
                };
            }, false);
            setScanning(false)
        } else {
            toaster.error({ title: "Lỗi", description: res.error });
            setScanning(false)
        }
    };

    return (
        <Dialog.Root lazyMount open={open} onOpenChange={(e) => setOpen(e.open)} size={'md'}>
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
                                    constraints={{ facingMode: "environment" }}
                                    scanDelay={300}
                                    onResult={(result, error) => {
                                        if (!!result) {
                                            const text = result.getText ? result.getText() : "";
                                            if (text) {
                                                handleScan(text, type)
                                            }
                                        }
                                        if (!!error) {
                                            // ignore or log
                                            console.error(error);
                                        }
                                    }}

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
                        </Dialog.Body>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default ScanDialog