"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Box, Spinner } from "@chakra-ui/react";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

export default function RealtimeUserMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTracking, setIsTracking] = useState(false);

    useEffect(() => {
        if (mapRef.current || !mapContainer.current) return;

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/standard", // style sáng
            center: [106.7, 10.8], // TP.HCM mặc định
            zoom: 14,
            // pitch: 60, // nghiêng nhìn giống GG Maps
            bearing: 0,
            attributionControl: false,
        });

        // Control zoom/rotate
        map.addControl(new mapboxgl.NavigationControl(), "top-right");
        map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-right");

        map.on("load", () => {
            setIsLoading(false);
            setIsTracking(true);
        });

        mapRef.current = map;

        return () => {
            map.remove();
        };
    }, []);

    // Cập nhật vị trí người dùng mỗi 2 giây
    useEffect(() => {
        if (!isTracking) return;
        const map = mapRef.current;
        if (!map) return;

        let intervalId: NodeJS.Timeout;

        // Hàm cập nhật vị trí
        const updateLocation = () => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude, heading } = pos.coords;
                    const coords: [number, number] = [longitude, latitude];

                    // Nếu marker chưa có, tạo mới
                    if (!userMarkerRef.current) {
                        userMarkerRef.current = new mapboxgl.Marker({
                            color: "#007AFF", // màu xanh iOS
                            rotationAlignment: "map",
                        })
                            .setLngLat(coords)
                            .addTo(map);
                    } else {
                        // Di chuyển marker tới vị trí mới
                        userMarkerRef.current.setLngLat(coords);
                    }

                    // Camera follow theo người dùng
                    map.easeTo({
                        center: coords,
                        bearing: heading || map.getBearing(),
                        zoom: 17,
                        duration: 1000,
                        pitch: 60,
                        essential: true,
                    });
                },
                (error) => {
                    console.error("Không thể lấy vị trí:", error);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 5000,
                }
            );
        };

        // Gọi lần đầu
        updateLocation();
        // Lặp lại mỗi 2 giây
        intervalId = setInterval(updateLocation, 2000);

        return () => {
            clearInterval(intervalId);
        };
    }, [isTracking]);

    return (
        <Box position="relative" w="full" h="600px">
            {/* Bản đồ */}
            <Box
                ref={mapContainer}
                w="full"
                h="full"
                borderRadius="xl"
                borderWidth="1px"
                shadow="md"
                overflow="hidden"
            />

            {/* Spinner */}
            {isLoading && (
                <Spinner
                    size="lg"
                    color="purple.400"
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                />
            )}
        </Box>
    );
}
