import { Geometry } from "geojson";

interface PopulateResponse {
  code: string;
  name: string;
}

export interface ResponseTileSet {
  _id: string;
  code: string;
  name: string;
  regionId?: PopulateResponse;
  provinceId?: PopulateResponse;
  wardId?: PopulateResponse;
  tileset: string;
  geometry: Geometry
}

