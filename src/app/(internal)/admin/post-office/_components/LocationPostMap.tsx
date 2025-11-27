"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Box, Spinner } from "@chakra-ui/react";
import "mapbox-gl/dist/mapbox-gl.css";
import { UseFormSetValue } from "react-hook-form";
import { bbox, booleanPointInPolygon, buffer, point } from "@turf/turf";
import { get } from "@/apis/apiCore";
import { toaster } from "@/components/ui/toaster";
import { ResponseTileSet } from "@/types/responseTileSet";
import { Feature, FeatureCollection, GeoJsonProperties, MultiPolygon, Polygon } from "geojson";
import { isPointInZone } from "../_libs/isPointInZone";

interface Props {
    valueType: string[];
    zoneId: string | undefined;
    lngLat: string | undefined;
    setLngLat: React.Dispatch<React.SetStateAction<string | undefined>>;
    setValue: UseFormSetValue<{
        type: string[];
        name: string;
        code: string;
        addressNumber: string;
        address: string;
        zone: string;
        lngLat: string;
    }>
}

interface ResponseZone {
    _id: string;
    code: string;
    name: string;
    geometry: ResponseTileSet['geometry']
}


const LocationPostMap = memo(({ zoneId, valueType, lngLat, setLngLat, setValue }: Props) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dataZone, setDataZone] = useState<ResponseZone | undefined>()

    useEffect(() => {
        if (mapRef.current || !mapContainer.current) return;

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;
        console.log(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!)
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12", // style sáng
            center: [107.360, 15.503],
            zoom: 5,
            projection: 'mercator',
            attributionControl: false,
        });

        map.addControl(new mapboxgl.NavigationControl(), "top-right");
        map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-right");

        map.on("load", () => {
            setIsLoading(false);


        })

        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                map.remove();
            }
        };

    }, [])


    useEffect(() => {
        console.log(lngLat)
        if (!lngLat || !mapRef.current || !dataZone) return;
        const map = mapRef.current
        const coordinates: { longitude: number, latitude: number } = JSON.parse(lngLat)
        const marker = new mapboxgl.Marker({ draggable: true, color: '#FF0000' })
            .setLngLat([coordinates.longitude, coordinates.latitude])
            .addTo(map)

        const pointMarker = point([coordinates.longitude, coordinates.latitude]);
        const buffered = buffer(pointMarker, 20, { units: "meters" });
        const bboxMarker = buffered && bbox(buffered);
        map.fitBounds(bboxMarker as [number, number, number, number], {
            padding: 100,
            duration: 1000,
            maxZoom: 17,
        });
        markerRef.current = marker
        const checkPoint = isPointInZone(coordinates.longitude, coordinates.latitude, dataZone.geometry);
        if (!checkPoint) {
            queueMicrotask(() => {
                toaster.error({
                    id: `Error-LngLat-${Date.now}`,
                    title: "Vị trí không chính xác",
                    description: "Địa chỉ không nằm trong khu vực hoạt động đã chọn"
                })
            })
            setValue("lngLat", '')
        } else {
            setValue("lngLat", lngLat)
        }
        marker.on("dragend", () => {
            const coordinatesLngLat = marker.getLngLat();
            const valueLngLat = JSON.stringify({ longitude: coordinatesLngLat.lng, latitude: coordinatesLngLat.lat })
            setLngLat(valueLngLat)

        });
        return () => {
            if (markerRef.current) {
                marker.remove()
            }
        }
    }, [lngLat, dataZone])


    useEffect(() => {
        if (!zoneId || valueType.length < 1) return;
        const fetch = async () => {
            const namePath = valueType[0] === 'sorting_center'
                ? "region"
                : valueType[0] === "distribution_hub"
                    ? "province"
                    : "ward"

            const res = await get<ResponseZone>(`/mapbox/${namePath}/${zoneId}`)
            if (!res.success) {
                toaster.error({
                    id: `Error-zone-${Date.now}`,
                    title: res.error
                })
            } else {
                setDataZone(res.result)
            }
        }
        fetch()

    }, [zoneId])

    useEffect(() => {
        if (!dataZone || !mapRef.current) return;
        const map = mapRef.current
        const dataGeojson: FeatureCollection<Polygon | MultiPolygon, GeoJsonProperties> = {
            type: "FeatureCollection",
            features: [{
                type: "Feature",
                geometry: dataZone.geometry,
                properties: {
                    name: dataZone.name,
                    code: dataZone.code
                }
            }] as Feature<Polygon | MultiPolygon, GeoJsonProperties>[]
        }
        const initialBbox = bbox(dataGeojson) as [number, number, number, number];

        if (initialBbox) map.fitBounds(initialBbox, { padding: 30, duration: 800 });
        // Nếu source map đã tồn tại → update data
        if (map.getSource("addPostMap")) {
            (map.getSource("addPostMap") as mapboxgl.GeoJSONSource).setData(dataGeojson);
            return; // Không addSource, addLayer nữa
        }
        map.addSource("addPostMap", {
            type: "geojson",
            data: dataGeojson,
        });
        map.addLayer({
            id: `addPostMap-fill`,
            type: "fill",
            source: `addPostMap`,
            paint: {
                "fill-color": '#00ffff',
                "fill-opacity": 0.5,
            },
        });
    }, [dataZone])
    return (
        <Box position="relative" w="full" h="300px">
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

export default LocationPostMap