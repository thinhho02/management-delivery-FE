"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";
import { Box, Spinner } from "@chakra-ui/react";
import { ResponseDetailOrder } from "../_types/responseDetailOrder";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

export default function TrackingOrderMap({ order }: { order: ResponseDetailOrder }) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);

    const [loading, setLoading] = useState(true);

    // -----------------------------------------------
    // SHORTCUTS
    // -----------------------------------------------
    const seller = order.seller.location?.coordinates;
    const customer = order.customer.location?.coordinates;
    const currentType = order.shipment.currentType;
    const lastEvent = order.shipment.events.at(-1);

    // SHIPPER / OFFICE POSITION
    const getCurrentPos = () => {
        if (!lastEvent) return null;

        if (["pickup", "waiting_delivery"].includes(lastEvent.eventType)) {
            return lastEvent.shipperDetailId?.location?.coordinates
        }

        if (lastEvent.eventType === "transferring") {
            return lastEvent.shipperDetailId?.location?.coordinates
        }

        if (["arrival", "departure"].includes(lastEvent.eventType)) {
            return lastEvent.officeId?.location?.coordinates
        }

        return null;
    };

    const pos = getCurrentPos();

    // -----------------------------------------------
    // INIT MAP
    // -----------------------------------------------
    useEffect(() => {
        if (mapRef.current || !mapContainerRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [106, 17],
            zoom: 5,
        });

        map.addControl(new mapboxgl.NavigationControl(), "top-right");
        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null
            }
        }
    }, []);

    // -----------------------------------------------
    // 1. CREATED → single blue route
    // 2. IN_TRANSIT → 2 routes (gray + blue)
    // 3. DELIVERED → single gray route
    // 4. CANCELLED → no route
    // -----------------------------------------------
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !seller || !customer) return;
        map.on("style.load", () => {

            const clearLayers = () => {
                ["route-blue", "route-gray"].forEach(id => {
                    if (map.getLayer(id)) map.removeLayer(id);
                    if (map.getSource(id)) map.removeSource(id);
                });
            };

            clearLayers();

            // Canceled / Returned → no route
            if (["cancelled", "returned"].includes(order.status)) {
                setLoading(false);
                return;
            }

            // -----------------------------------
            // CASE 1: created → single blue
            // -----------------------------------
            const isOnlyBlue =
                order.status === "created" || (!pos && order.status !== "delivered");

            const renderSingleRoute = async (color: string) => {
                const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${seller.join(
                    ","
                )};${customer.join(",")}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken
                    }`;

                const res = await axios.get(url);
                const route = res.data.routes[0].geometry;

                map.addSource("route-blue", {
                    type: "geojson",
                    data: { type: "Feature", geometry: route, properties: {} },
                });

                map.addLayer({
                    id: "route-blue",
                    type: "line",
                    source: "route-blue",
                    paint: {
                        "line-color": color,
                        "line-width": 5,
                    },
                });

                // Fit bounds
                const bounds = new mapboxgl.LngLatBounds();
                route.coordinates.forEach((c: any) => bounds.extend(c));
                map.fitBounds(bounds, { padding: 20, duration: 800 });

                setLoading(false);
            };

            // CREATED → 1 Directions API (Blue)
            if (isOnlyBlue && order.status !== "delivered") {
                renderSingleRoute("#007AFF");
                return;
            }

            // -----------------------------------
            // CASE 2: delivered → 1 gray route
            // -----------------------------------
            if (order.status === "delivered") {
                renderSingleRoute("#8B8B8B");
                return;
            }

            // -----------------------------------
            // CASE 3: in_transit → 2 routes
            // seller → pos (gray)
            // pos → customer (blue)
            // -----------------------------------
            (async () => {
                if (!pos) return;

                // GRAY route (completed)
                const urlGray = `https://api.mapbox.com/directions/v5/mapbox/driving/${seller.join(
                    ","
                )};${pos.join(",")}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken
                    }`;

                const urlBlue = `https://api.mapbox.com/directions/v5/mapbox/driving/${pos.join(
                    ","
                )};${customer.join(",")}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken
                    }`;

                const [resGray, resBlue] = await Promise.all([
                    axios.get(urlGray),
                    axios.get(urlBlue),
                ]);

                const grayGeom = resGray.data.routes[0].geometry;
                const blueGeom = resBlue.data.routes[0].geometry;

                // -----------------------
                // Add GRAY
                // -----------------------
                console.log("api 123123")
                map.addSource("route-gray", {
                    type: "geojson",
                    data: { type: "Feature", geometry: grayGeom, properties: {} },
                });
                map.addLayer({
                    id: "route-gray",
                    type: "line",
                    source: "route-gray",
                    paint: {
                        "line-color": "#8B8B8B",
                        "line-width": 5,
                    },
                });

                // -----------------------
                // Add BLUE
                // -----------------------
                map.addSource("route-blue", {
                    type: "geojson",
                    data: { type: "Feature", geometry: blueGeom, properties: {} },
                });
                map.addLayer({
                    id: "route-blue",
                    type: "line",
                    source: "route-blue",
                    paint: {
                        "line-color": "#007AFF",
                        "line-width": 5,
                    },
                });

                // Fit all
                const bounds = new mapboxgl.LngLatBounds();
                blueGeom.coordinates.forEach((c: any) => bounds.extend(c));
                map.fitBounds(bounds, { padding: 20, duration: 800 });

                setLoading(false);
            })();
        })
    }, [order.status, order.shipment.events]);

    // -----------------------------------------------
    // RENDER MAP + MARKERS
    // -----------------------------------------------
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !seller || !customer) return;

        // Seller / customer marker
        new mapboxgl.Marker({ color: "#FF3B30" })
            .setLngLat(seller)
            .setPopup(new mapboxgl.Popup({ closeButton: false }).setHTML(`<b style="color: black">Người gửi</b>`))
            .addTo(map);

        new mapboxgl.Marker({ color: "#4CD964" })
            .setLngLat(customer)
            .setPopup(new mapboxgl.Popup({ closeButton: false }).setHTML(`<b style="color: black">Người nhận</b>`))
            .addTo(map);

        // Marker current pos
        const icon =
            currentType === "pickup" || currentType === "waiting_delivery"
                ? "🏍️"
                : currentType === "transferring"
                    ? "🚛"
                    : "🏤";

        if (pos) {
            const el = document.createElement("div");
            el.style.fontSize = "28px";
            el.innerHTML = icon;

            new mapboxgl.Marker({ element: el })
                .setLngLat(pos as [number, number])
                // .setPopup(new mapboxgl.Popup().setHTML(`<b style="color: black">Đang vận chuyển</b>`))
                .addTo(map);
        }
    }, [order.shipment.currentType]);

    return (
        <Box w="full" h="full" position="relative">
            <Box ref={mapContainerRef} w="full" h="full" />
            {loading && (
                <Spinner
                    size="lg"
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                />
            )}
        </Box>
    );
}
