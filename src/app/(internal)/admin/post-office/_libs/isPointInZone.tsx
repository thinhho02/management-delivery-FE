import { booleanPointInPolygon, point } from "@turf/turf";
import { Feature, GeoJsonProperties, Geometry, MultiPolygon, Polygon } from "geojson";

export function isPointInZone(lng: number, lat: number, geometry: Geometry) {
    const pointInZone = point([lng, lat]);
    const polygon = {
        type: "Feature",
        geometry
    } as Feature<Polygon | MultiPolygon, GeoJsonProperties>
    return booleanPointInPolygon(pointInZone, polygon);
}