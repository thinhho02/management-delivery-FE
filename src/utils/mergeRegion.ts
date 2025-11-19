import { ResponseTileSet } from "@/types/responseTileSet";
import { bbox, bboxPolygon, feature, featureCollection, intersect, multiPolygon, polygon, union } from "@turf/turf";
import { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon } from "geojson";

export function mergeProvincesToRegion(
    provinces: ResponseTileSet[]
): FeatureCollection<Polygon | MultiPolygon> {
    if (!provinces.length) {
        return featureCollection([]) as FeatureCollection<
            Polygon | MultiPolygon
        >;
    }

    // 1. Chuẩn hóa tất cả geometry thành Feature<Polygon | MultiPolygon>
    const features = provinces.map((p) =>
        feature(p.geometry, { name: p.name })
    ) as Feature<Polygon | MultiPolygon>[];

    // 2. Tạo FeatureCollection
    const fc: FeatureCollection<Polygon | MultiPolygon> = featureCollection(features);

    // 3. Dùng union() mới
    const merged = union(fc);
    if (!merged) {
        return featureCollection([]) as FeatureCollection<
            Polygon | MultiPolygon
        >;
    }

    return featureCollection([merged]) as FeatureCollection<
        Polygon | MultiPolygon
    >;
}


/**
 * Chia 1 polygon (ward) thành 3 polygon con
 * - Dựa trên chiều cao (trục Y – latitude)
 * - Trả về FeatureCollection gồm 3 polygon con
 */
export function splitWardInto3(
    tiles: ResponseTileSet[]
) {
    const features: Feature[] = []
    let count = 0;
    tiles.map((tile) => {
        if (tile.provinceId?.code === "79"
            || tile.provinceId?.code === "96"
        ) {
            // 1. Lấy bounding box của ward
            const [minX, minY, maxX, maxY] = bbox(tile.geometry);

            // 2. Tính 2 đường chia theo chiều dọc
            const height = maxY - minY;

            const y1 = minY + height / 3;
            const y2 = minY + (height * 2) / 3;
            const wardPolygon = tile.geometry.type == 'Polygon'
                ? polygon(tile.geometry.coordinates)
                : tile.geometry.type == 'MultiPolygon'
                    ? multiPolygon(tile.geometry.coordinates) 
                    : polygon([[]])

            // 3. Tạo 3 bbox polygon tương ứng
            const box1 = bboxPolygon([minX, minY, maxX, y1], { properties: { ma_xa: tile.code as string, ma_sz: `sz_2025${++count}`, ten_sz: `Khu vực ship ${count}` } });
            const box2 = bboxPolygon([minX, y1, maxX, y2], { properties: { ma_xa: tile.code as string, ma_sz: `sz_2025${++count}`, ten_sz: `Khu vực ship ${count}` } });
            const box3 = bboxPolygon([minX, y2, maxX, maxY], { properties: { ma_xa: tile.code as string, ma_sz: `sz_2025${++count}`, ten_sz: `Khu vực ship ${count}` } });

            // 4. Cắt ward bằng intersect()
            const p1 = intersect(featureCollection<Polygon | MultiPolygon>([wardPolygon, box1]));
            const p2 = intersect(featureCollection<Polygon | MultiPolygon>([wardPolygon, box2]));
            const p3 = intersect(featureCollection<Polygon | MultiPolygon>([wardPolygon, box3]));

            // 5. Lọc phần null (khi ward không giao nhau)
            const results = [
                p1 && { ...p1, properties: box1.properties },
                p2 && { ...p2, properties: box2.properties },
                p3 && { ...p3, properties: box3.properties },
            ].filter(Boolean) as Feature[];
            features.push(...results);
        }
    })

    return featureCollection(features);
}