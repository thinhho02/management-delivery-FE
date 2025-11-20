'use client';

import { useSocket } from '@/providers/SocketProvider';
import React, { useEffect, useRef } from 'react';
import { toaster } from './toaster';
import { formatDateVN } from '@/utils/formatDateVN';



interface PayloadEventDevice {
  sid: string;
  id: string;
  title: string;
  message: string;
  time: Date;
  type: string;
}

const safeToast = (cb: () => void) => {
  // chạy sau commit → tránh flushSync error
  queueMicrotask(cb);
};

const ToasterNotify = () => {
  const { isConnected, socket, manualDisconnectRef } = useSocket();

  // ID toast hiện tại (disconnect, reconnect, unstable)
  const toastIdRef = useRef<string | null>(null);

  // Đánh dấu mount lần đầu
  const initializedRef = useRef(false);

  // Đánh dấu đã từng bị mất kết nối chưa
  const lostConnectionRef = useRef(false);

  // --------------------------------------
  // MAIN EFFECT: theo dõi isConnected
  // --------------------------------------
  useEffect(() => {
    // Lần mount đầu → không hiển thị toast
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    // CASE 1: từ connected → disconnected
    if (isConnected === false) {
      // ❗ Nếu user logout → không báo lỗi mất mạng
      if (manualDisconnectRef.current) return;
      lostConnectionRef.current = true;

      const id = `toast-disconnect-${Date.now()}`;
      toastIdRef.current = id;

      safeToast(() =>
        toaster.create({
          id,
          title: 'Mất kết nối mạng',
          description: 'Vui lòng kiểm tra mạng hoặc đợi hệ thống tự kết nối lại.',
          type: 'error',
          duration: 60 * 1000,
        })
      );

      return;
    }

    // CASE 2: từ disconnected → connected
    if (isConnected === true && lostConnectionRef.current) {
      lostConnectionRef.current = false;

      if (toastIdRef.current) {
        safeToast(() =>
          toaster.update(toastIdRef.current!, {
            title: 'Kết nối lại thành công',
            description: 'Đã kết nối lại với máy chủ.',
            type: 'success',
            duration: 3000,
            removeDelay: 1000
          })
        );

        // Xoá ID sau khi toast tự tắt
        setTimeout(() => {
          toastIdRef.current = null;
        }, 3000);
      }
    }
  }, [isConnected]);

  // --------------------------------------
  // OPTIONAL: mạng không ổn định → reconnect_attempt
  // --------------------------------------
  useEffect(() => {
    if (!socket) return;

    const handleReconnectAttempt = () => {
      // Chưa từng connect → không hiển thị
      if (!initializedRef.current) return;

      const id = toastIdRef.current || `toast-unstable-${Date.now()}`;
      toastIdRef.current = id;

      safeToast(() =>
        toaster.warning({
          id,
          title: 'Mạng không ổn định',
          description: 'Đang thử kết nối lại với máy chủ...',
          duration: 60 * 1000,
        })
      );
    };

    socket.io.on('reconnect_attempt', handleReconnectAttempt);

    return () => {
      socket.io.off('reconnect_attempt', handleReconnectAttempt);
    };
  }, [socket]);


  // Lắng nghe sự kiện device_suspicious
  useEffect(() => {
    if (!socket) return;

    const handleSuspicious = (payload: PayloadEventDevice) => {
      const id = `toast-device-suspicious-${Date.now()}`;

      // chạy sau commit → tránh flushSync error
      queueMicrotask(() =>
        toaster.warning({
          id,
          title: payload.title,
          description: `${payload.message} - Vào lúc: ${formatDateVN(payload.time)}`,
          duration: 60 * 60 * 1000,
          removeDelay: 1000,
          action: {
            label: "Không phải tôi?",
            onClick: async () => {
              console.log("Đang xử lý...");
              await new Promise(res => setTimeout(res, 3000));
              console.log("Gửi API logout thiết bị đáng ngờ:", payload.sid);
            }
          }
        })
      );
    };

    socket.on("event:device_suspicious", handleSuspicious);

    return () => {
      socket.off("event:device_suspicious", handleSuspicious);
    };
  }, [socket]);

  return null;
};

export default ToasterNotify;
