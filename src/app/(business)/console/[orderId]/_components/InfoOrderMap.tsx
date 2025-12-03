'use client'

import React, { memo, useEffect, useRef, useState } from 'react'
import { ResponseDetailOrder } from '../_types/responseDetailOrder';
import mapboxgl from "mapbox-gl";
import { Box, Spinner } from '@chakra-ui/react';
import { lineString } from '@turf/turf';
import axios from 'axios';
import { toaster } from '@/components/ui/toaster';
import "mapbox-gl/dist/mapbox-gl.css";


const InfoOrderMap = memo(({ order }: { order: ResponseDetailOrder }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const seller = order.seller.location?.coordinates;
  const customer = order.customer.location?.coordinates;

  // ====== Load Map + Marker + LineString ======
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;
    if (!seller || !customer) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [106, 17],
      zoom: 5,
      projection: "mercator",
      attributionControl: false,
      logoPosition: 'top-left'
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-right");

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null
      }
    };
  }, []);


  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!seller || !customer) return;

    // Wait until style is ready
    map.on("style.load", () => {

        console.log("seller", seller)
        console.log("customer", customer)

        new mapboxgl.Marker({ color: "#f90000ff" })
          .setLngLat(seller)
          .setPopup(new mapboxgl.Popup({closeButton: false}).setHTML(`<b style="color: black">Người gửi</b>`))
          .addTo(map);

        new mapboxgl.Marker({ color: "#0004ffff" })
          .setLngLat(customer)
          .setPopup(new mapboxgl.Popup().setHTML(`<b style="color: black">Người nhận</b>`))
          .addTo(map);

      
      // ======== ADD MARKERS ========

      setIsLoading(false);

      // ======== LOAD DIRECTIONS ROUTE ========
      const fetchRoute = async () => {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${seller.join(
          ","
        )};${customer.join(
          ","
        )}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

        try {
          const res = await axios.get(url);
          const data = res.data;

          if (!data.routes?.length) {
            toaster.error({
              id: "route-not-found",
              title: "Không tìm thấy đường đi!",
            });
            return;
          }

          const route = data.routes[0].geometry;

          // Clean old layers/sources
          if (map.getLayer("route-line")) map.removeLayer("route-line");
          if (map.getSource("route")) map.removeSource("route");

          map.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: route,
              properties: {},
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

          // Fit all coordinates of route
          const bounds = new mapboxgl.LngLatBounds();
          route.coordinates.forEach((c: any) => bounds.extend(c));
          map.fitBounds(bounds, { padding: 20, duration: 800 });
        } catch (err) {
          console.log(err);
        }
      };

      fetchRoute();

    });
  }, [seller, customer]);



  return (
    <Box position="relative" w="full" h="full">
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
  )
})

export default InfoOrderMap