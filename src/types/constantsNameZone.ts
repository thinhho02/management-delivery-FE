export type IZones = {
    name: string;
    label: string;
    nameCode: string;
    parent?: string;
}
export const zones: IZones[] = [
    { name: "region", label: "Vùng miền", nameCode: 'vung' },
    { name: "province", label: "Tỉnh/thành", nameCode: 'tinh' , parent: "regionId" },
    { name: "ward", label: "Phường/Xã", nameCode: 'xa', parent: "provinceId" },
    { name: "shipperZone", label: "Khu vực hoạt động shipper", nameCode: 'sz', parent: "wardId" }
]