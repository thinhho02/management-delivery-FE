"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Box, Spinner } from "@chakra-ui/react";
import "mapbox-gl/dist/mapbox-gl.css";
import { UseFormSetValue } from "react-hook-form";
import { bbox, buffer, point } from "@turf/turf";
import { get } from "@/apis/apiCore";
import { toaster } from "@/components/ui/toaster";
import { Feature, FeatureCollection, GeoJsonProperties, Geometry, MultiPolygon, Polygon } from "geojson";
import useSWR from "swr";
import axios from "axios";
import { isPointInZone } from "@/app/(internal)/admin/post-office/_libs/isPointInZone";

interface Props {
    lngLat: string | undefined;
    wardId: { wardId: string, wardName: string } | undefined;
    setLngLat: React.Dispatch<React.SetStateAction<string | undefined>>;
    setAddressMarker: React.Dispatch<React.SetStateAction<string | undefined>>;
    setValue: UseFormSetValue<{
        name: string;
        email: string;
        checkEmail: boolean;
        numberPhone: string;
        address: string;
        lngLat: string;
        provinceId: string;
        wardId: string;
    }>
}

interface ResponseZone {
    _id: string;
    code: string;
    name: string;
    geometry: Geometry
}


const LocationUserMap = memo(({ lngLat, setLngLat, setValue, wardId, setAddressMarker }: Props) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { data: dataWard } = useSWR(wardId ? `/mapbox/ward/${wardId.wardId}` : null, get<ResponseZone>, {
        revalidateOnFocus: false
    })

    const fetchReverseGeo = async (latlng: string) => {
        const latLog = JSON.parse(latlng) as {
            longitude: number,
            latitude: number
        }
        const queryString = [latLog.latitude, latLog.longitude].join(",")
        try {
            const OPENMAP_KEY = process.env.NEXT_PUBLIC_OPENMAP_KEY!
            const res = await axios.get(`https://mapapis.openmap.vn/v1/geocode/reverse?latlng=${queryString}&admin_v2=true&apikey=${OPENMAP_KEY}`)
            const features = res.data.results
            features.map((feature: any) => {
                // const label = `${feature.properties.name}, ${feature.properties.context.locality.name}, `
                const value = feature.formatted_address
                setAddressMarker(value)
                setValue("address", value)
            })

        } catch (error) {
            console.log(error)
        }
    }


    useEffect(() => {
        if (mapRef.current || !mapContainer.current) return;

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;
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
                mapRef.current.remove()
                mapRef.current = null
            }
        };

    }, [])


    useEffect(() => {

        if (!lngLat || !dataWard || !dataWard.success || !mapRef.current) return;
        const map = mapRef.current
        const coordinates: { longitude: number, latitude: number } = JSON.parse(lngLat)
        if (!markerRef.current) {
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
            marker.on("dragend", async () => {
                const coordinatesLngLat = marker.getLngLat();
                const valueLngLat = JSON.stringify({ longitude: coordinatesLngLat.lng, latitude: coordinatesLngLat.lat })
                setLngLat(valueLngLat)
                setValue("lngLat", valueLngLat, { shouldDirty: true })
                await fetchReverseGeo(valueLngLat)

            });
        } else {
            markerRef.current.setLngLat([coordinates.longitude, coordinates.latitude]);
        }
        const checkPoint = isPointInZone(coordinates.longitude, coordinates.latitude, dataWard.result.geometry);
        if (!checkPoint) {
            queueMicrotask(() => {
                toaster.error({
                    id: `Error-LngLat-${Date.now}`,
                    title: "Vị trí không chính xác",
                    description: "Địa chỉ không nằm trong khu vực đã chọn"
                })
            })
            setValue("lngLat", '', { shouldDirty: true })
        } else {
            setValue("lngLat", lngLat, { shouldDirty: true })
        }



        return () => {
            if (markerRef.current) {
                markerRef.current.remove()
                markerRef.current = null
            }
        }
    }, [lngLat, dataWard])



    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;

        const handleClick = async (e: mapboxgl.MapMouseEvent & mapboxgl.MapEvent) => {
            const { lng, lat } = e.lngLat;

            const newValue = JSON.stringify({ longitude: lng, latitude: lat });

            // Nếu marker chưa tồn tại → tạo marker mới
            if (!markerRef.current) {
                const marker = new mapboxgl.Marker({ draggable: true, color: "#FF0000" })
                    .setLngLat([lng, lat])
                    .addTo(map);
                const pointMarker = point([lng, lat]);
                const buffered = buffer(pointMarker, 20, { units: "meters" });
                const bboxMarker = buffered && bbox(buffered);
                map.fitBounds(bboxMarker as [number, number, number, number], {
                    padding: 100,
                    duration: 1000,
                    maxZoom: 17,
                });
                markerRef.current = marker;

                marker.on("dragend", async () => {
                    const pos = marker.getLngLat();
                    const valueLngLat = JSON.stringify({
                        longitude: pos.lng,
                        latitude: pos.lat,
                    });
                    setLngLat(valueLngLat);
                    setValue("lngLat", valueLngLat, { shouldDirty: true });
                    await fetchReverseGeo(valueLngLat)

                });
            }

            // Cập nhật value form
            setLngLat(newValue);
            setValue("lngLat", newValue, { shouldDirty: true });
            await fetchReverseGeo(newValue)
        };

        map.on("click", handleClick);

        return () => {
            map.off("click", handleClick);
            if (markerRef.current) {
                markerRef.current.remove()
                markerRef.current = null
            }

        };
    }, [setLngLat, setValue]);


    useEffect(() => {
        if (!wardId || !dataWard || !dataWard.success || !mapRef.current) return;

        const map = mapRef.current
        const dataZone = dataWard.result
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

        const safeAddLayer = () => {
            const initialBbox = bbox(dataGeojson) as [number, number, number, number];

            if (initialBbox) map.fitBounds(initialBbox, { padding: 30, duration: 800 });
            // Nếu source map đã tồn tại → update data
            if (map.getSource("MapUserDefault")) {
                (map.getSource("MapUserDefault") as mapboxgl.GeoJSONSource).setData(dataGeojson);
                return; // Không addSource, addLayer nữa
            }
            map.addSource("MapUserDefault", {
                type: "geojson",
                data: dataGeojson,
            });
            map.addLayer({
                id: `MapUserDefault-fill`,
                type: "fill",
                source: `MapUserDefault`,
                paint: {
                    "fill-color": '#00ffff',
                    "fill-opacity": 0.2,
                },
            });
        }
        // Style chưa load → đợi
        if (!map.isStyleLoaded()) {
            map.once("styledata", safeAddLayer);
        } else {
            safeAddLayer();
        }

        // return () => {
        //     if (map.getSource("MapUserDefault")) {
        //         map.removeSource("MapUserDefault")
        //     }
        // }
    }, [wardId, dataWard])

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

export default LocationUserMap