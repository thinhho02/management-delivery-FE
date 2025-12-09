import { MapboxStyleApi } from "@/types/mapboxStyle";

interface IStaticMapURL {
    style?: MapboxStyleApi;
    sourceLayer: string;
    tileID: string;
    width: number;
    height: number;
}
function long2tile(lon: number, zoom: number) {
    return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

function lat2tile(lat: number, zoom: number) {
    return Math.floor(
        ((1 -
            Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) /
            Math.PI) /
            2) *
        Math.pow(2, zoom)
    );
}
interface Tile {
    [key: string]: number;
}

export async function generateStaticMapURL({
    style = "streets-v12",
    sourceLayer,
    tileID,
    width = 900,
    height = 900,
}: IStaticMapURL): Promise<string> {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;
    const response = await fetch(`https://api.mapbox.com/v4/${tileID}.json?access_token=${token}`)
    const tileMedata = await response.json()
    let [lon, lat, zoom] = tileMedata.center
    if(lon == 0){
        lon = 106
    }
    if(lat == 0){
        lat = 10.5
    }
    if(zoom == 0){
        zoom = 6
    }
    const x = long2tile(lon, zoom)
    const y = lat2tile(lat, zoom)
    const z = zoom as number
    const str = tileMedata.tiles[0] as string;
    const mapObj: Tile = {
        z: z,
        y: y,
        x: x
    };

    const path = str.replace(/{z}|{x}|{y}/gi, (matched) => {
        // matched là dạng "{z}" nên ta cần bỏ ngoặc nhọn
        const key = matched.replace(/[{}]/g, ""); // z, x, y
        return String(mapObj[key]); // chuyển number thành string để replace hợp lệ
    });

    const bounds = tileMedata.bounds
    const layer =
    // {
    //     "id": `${sourceLayer}-fill`,
    //     "type": "fill",
    //     "source": {
    //         "type": "vector",
    //         "url": `mapbox://${tileID}`
    //     },
    //     "source-layer": sourceLayer,
    //     "paint": {
    //         "fill-color": "%23ff00ff",
    //         "fill-opacity": 0.4,
    //     },
    // }
    // ,
    {
        id: `${sourceLayer}-fill`,
        type: "line",
        source: {
            type: "vector",
            url: `mapbox://${tileID}`
        },
        "source-layer": sourceLayer,
        // filter: ["==", ["get", "class"], "motorway"],
        paint: {
            "line-color": "#ff00ff",
            "line-width": "1.4",
            "line-blur": "1.2",
            "line-opacity": "0.4"
        }
    }
    const beforeLayer = 'road-label'
    const addlayers = encodeURIComponent(JSON.stringify(layer));


    return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/[${bounds.join(",")}]/${width}x${height}@2x?access_token=${token}&logo=false&addlayer=${addlayers}&before_layer=${beforeLayer}`;
}
