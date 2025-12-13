import { APIResponse, update } from "@/apis/apiCore";
import { Point } from "geojson";
import { KeyedMutator, mutate } from "swr";
import { IShipper } from "../_provider/ShipperInfoProvider";

export function getCurrentLocation(): Promise<Point> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("Geolocation not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                resolve({
                    type: "Point",
                    coordinates: [
                        pos.coords.longitude,
                        pos.coords.latitude
                    ]
                });
            },
            (err) => reject(err),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

export async function updateShipperLocation(
    shipperId: string,
) {
    try {
        const location = await getCurrentLocation();

        update(`/shipper/${shipperId}/location`, { location }).catch(err => console.log("Không thể cập nhật vị trí shipper:", err))

    } catch (err) {
        console.warn("Không thể cập nhật vị trí shipper:", err);
    }
}