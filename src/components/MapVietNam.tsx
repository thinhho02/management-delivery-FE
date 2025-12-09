"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Box, Spinner } from "@chakra-ui/react";

import type { LineString } from "geojson"

import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapVietnamTileset() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userLocationRef = useRef<[number, number] | null>(null);
  const destMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/standard", // hoặc style riêng của bạn
      center: [108.3, 15.9],
      zoom: 6,
      // pitch: 60, // nghiêng nhìn giống GG Maps
      // bearing: 0,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-right");
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      showUserHeading: true,
      trackUserLocation: true,
      // fitBoundsOptions: { maxZoom: 18 },
    })
    map.addControl(geolocate)
    geolocate.on("geolocate", (pos) => {
      const { longitude, latitude } = pos.coords;
      userLocationRef.current = [longitude, latitude] as [number, number];

      // map.easeTo => mượt hơn flyTo
      map.easeTo({
        center: userLocationRef.current,
        // bearing: heading || map.getBearing(),
        // pitch: 60,
        zoom: 17,
        duration: 1000,
        essential: true,
      });
    });
    geolocate.on("trackuserlocationstart", () => {
      navigator.geolocation.getCurrentPosition(position => {
        const { longitude, latitude } = position.coords;
        userLocationRef.current = [longitude, latitude];
      })
    })
    geolocate.on("trackuserlocationend", () => console.log("Tracking stopped"));
    geolocate.on("error", (err) => console.error("Geolocate error:", err));
    map.on("load", () => {
      setIsLoading(false);

      const tilesetId = 'hothinh089234.ward';
      const sourceLayer = "ward"; // ⚠️ đổi theo layer trong tileset

      // Source Tileset
      map.addSource("vietnam", {
        type: "vector",
        url: `mapbox://${tilesetId}`,
      });

      // Layer fill
      map.addLayer({
        id: "province-fill",
        type: "fill",
        source: "vietnam",
        "source-layer": sourceLayer,
        paint: {

          "fill-color": [
            "match",
            ["get", "ma_xa"],
            "26743", "#ff00ff",
            "#00ffff"
          ],
          "fill-opacity": 0.25,
        },
      });

      // Layer border
      map.addLayer({
        id: "province-line",
        type: "line",
        source: "vietnam",
        "source-layer": sourceLayer,
        paint: {
          "line-color": "black",
          "line-width": 1.4,
          "line-blur": 1.2,
        },
      });
      geolocate.trigger()


      // ✅ FIX 1: Popup click đúng vị trí con trỏ
      map.on("click", "province-fill", async (e) => {
        const feature = e.features?.[0];
        if (!feature || !feature.properties) return;

        const props = feature.properties;
        const coordinates = e.lngLat; // Lấy vị trí click thật

        const popupHtml = `
          <div style="font-size:14px;line-height:1.5;color:black;">
            <strong>${props.ten_tinh || "Không rõ"}</strong><br/>
            Mã tỉnh: ${props.ma_tinh || "?"}
          </div>
        `;

        new mapboxgl.Popup({ offset: 15, closeButton: true, anchor: "bottom-left" })
          .setLngLat(coordinates)
          .setHTML(popupHtml)
          .addTo(map);

        const userLoc = userLocationRef.current;
        if (!userLoc) {
          alert("Hãy cho phép truy cập vị trí trước khi xác định đường đi!");
          geolocate.trigger(); // kích hoạt lại nếu chưa có vị trí
          return;
        }

        await drawRoute(userLoc, [coordinates.lng, coordinates.lat]);
      });

      map.on("mouseenter", "province-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "province-fill", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  async function drawRoute(start: [number, number], end: [number, number]) {
    const map = mapRef.current;
    if (!map) return;

    // Xoá route cũ nếu có
    if (map?.getLayer("route-line")) {
      map.removeLayer("route-line");
      map.removeSource("route");
    }

    // Gọi Directions API
    // const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${start.join(",")};${end.join(",")}?access_token=${mapboxgl.accessToken}`
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.join(",")};${end.join(",")}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.routes?.length) {
      alert("Không tìm thấy đường đi!");
      return;
    }
    const route = data.routes[0].geometry as LineString;


    // Thêm route mới
    map.addSource("route", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          geometry: route,
          properties: {}
        }],
      },
    });

    map.addLayer({
      id: "route-line",
      type: "line",
      source: "route",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": "#007AFF",
        "line-width": 5,
        "line-opacity": 0.9,
      },
    });

    // // Marker điểm đến
    if (!destMarkerRef.current) {
      destMarkerRef.current = new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat(end)
        .addTo(map);
    } else {
      destMarkerRef.current.setLngLat(end);
    }

    // Fit bounds toàn tuyến
    const bounds = new mapboxgl.LngLatBounds();
    route.coordinates.forEach((c) => bounds.extend(c as [number, number]));
    map.fitBounds(bounds, { padding: 60 });
  }

  return (
    <Box position="relative" w="full" h="600px">
      <Box
        ref={mapContainer}
        w="full"
        h="full"
        borderRadius="xl"
        borderWidth="1px"
        shadow="md"
        overflow="hidden"
      />

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
