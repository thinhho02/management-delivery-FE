"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { AbsoluteCenter, Box, Heading, Spinner } from "@chakra-ui/react";

import 'mapbox-gl/dist/mapbox-gl.css';
import { bbox, featureCollection } from "@turf/turf";
import useSWR from "swr";
import { toaster } from "@/components/ui/toaster";
import { IZones } from "@/types/constantsNameZone";
import { Feature, FeatureCollection, GeoJsonProperties, Geometry, MultiPolygon, Polygon } from "geojson";
import { ResponseTileSet } from "@/types/responseTileSet";
import { splitWardInto3 } from "@/utils/mergeRegion";

interface AdminMapProps {
  tiles: ResponseTileSet[];
  activeTile: string | null;
  setActiveTile: React.Dispatch<React.SetStateAction<string | null>>;
  getNameZone: IZones,
  scrollToItem: (id: string) => void
}

type FeatureProperties = {
  ma_vung?: string;
  ma_tinh?: string;
  ma_xa?: string;
  ma_sz?: string;
  [key: string]: any;
};


const AdminMap = ({ tiles, activeTile, setActiveTile, getNameZone, scrollToItem}: AdminMapProps) => {

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;


    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/standard",
      projection: 'mercator',
      center: [107.360, 15.503],
      zoom: 5,
      // maxTileCacheSize: 0,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-right");

    map.on("load", () => {
      const dataGeojson: FeatureCollection<Polygon | MultiPolygon, GeoJsonProperties> = {
        type: "FeatureCollection",
        features: tiles.map((tile) => ({
          type: "Feature",
          properties: {
            code: tile.code,
            name: tile.name,
          },
          geometry: tile.geometry,
        })) as Feature<Polygon | MultiPolygon, GeoJsonProperties>[]
      }


      // // test
      //  const dataGeojsontest: FeatureCollection<Polygon | MultiPolygon, GeoJsonProperties> = {
      //   type: "FeatureCollection",
      //   features: [{
      //     type: "Feature",
      //     properties: {
      //       code: tiles[0].code,
      //       name: tiles[0].name,
      //     },
      //     geometry: tiles[0].geometry,
      //   }] as Feature<Polygon | MultiPolygon, GeoJsonProperties>[]
      // }
      // const f = splitWardInto3(tiles)
      // console.log("log: ",f)
      // ///
      const initialBbox = bbox(dataGeojson) as [number, number, number, number];

      if (initialBbox) map.fitBounds(initialBbox, { padding: 30, duration: 800 });
      // Source Tileset
      map.addSource("adminMap", {
        type: "geojson",
        data: dataGeojson,
      });

      // Layer fill
      map.addLayer({
        id: `${getNameZone.name}-fill`,
        type: "fill",
        source: `adminMap`,
        paint: {
          "fill-color": '#00ffff',
          "fill-opacity": 0.25,
        },
      });

      // Layer border
      map.addLayer({
        id: `${getNameZone.name}-line`,
        type: "line",
        source: "adminMap",
        paint: {
          "line-color": "black",
          "line-width": 1.4,
        },
      });


      map.on("click", `${getNameZone.name}-fill`, (e) => {
        const feature = e.features?.[0];
        if (!feature || !feature.properties) return;

        const { code } = feature.properties as FeatureProperties;

        if (!code) {
          console.warn(`Không tìm thấy ${code} trong properties`);
          return;
        }
        scrollToItem(code)
        setActiveTile(code)

      });

      map.on("mouseenter", `${getNameZone.name}-fill`, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", `${getNameZone.name}-fill`, () => {
        map.getCanvas().style.cursor = "";
      });
      setIsLoading(false);
    });

    mapRef.current = map;

    return () => {

      map.remove();
      mapRef.current = null
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeTile) return;
    if (!map.getLayer(`${getNameZone.name}-fill`)) return;


    const fc = tiles.find((t) => t.code === activeTile)
    if (!fc) return;
    const bounds = bbox(fc?.geometry) as [number, number, number, number];
    map.fitBounds(bounds, { padding: 40, duration: 800 });


    map.setPaintProperty(
      `${getNameZone.name}-fill`,
      "fill-color",
      ["case", ["==", ["get", `code`], activeTile ?? ""], "#ff00ff", "#00ffff"]
    );

  }, [activeTile]);


  return (
    <Box position="relative" w={'400px'} h={'500px'}>

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


export default AdminMap