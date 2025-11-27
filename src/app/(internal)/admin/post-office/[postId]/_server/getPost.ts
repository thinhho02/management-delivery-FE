'use server'

import { originBackend } from "@/apis/wsConfig"
import { Geometry } from "geojson";

interface IZone {
    _id: string;
    code: string;
    name: string;
    geometry: Geometry
}

interface ParentPost {
    _id: string;
    code: string;
    name: string;
    type: string
}

interface ManagerPost {
    _id: string;
    name: string;
}

export interface ResponsePost {
    _id: string;
    code: string;
    name: string;
    type: "sorting_center" | "distribution_hub" | "delivery_office";
    address: string;
    status: boolean;
    location: Geometry;
    regionId: IZone | null;
    provinceId: IZone | null;
    wardId: IZone | null;
    parentId: ParentPost | null
}

type ReturnFn = {
    success: false;
    error: string
} | {
    success: true;
    result: ResponsePost
}
export const getPostById = async (postId: string): Promise<ReturnFn> => {
    try {
        const res = await fetch(`${originBackend}/api/post-office/${postId}`)
        if (!res.ok) {
            return { success: false, error: res.statusText || "Request failed" }
        }
        const data: ResponsePost = await res.json()
        console.log(data)
        return { success: true, result: data }
    } catch (error: any) {
        console.log(error)
        return { success: false, error: "Request failed" }
    }
}