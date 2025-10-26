import api from "../api/mapAPI";
import type { FeatureCollection } from "geojson";

export type YearResponse = {
  year: number;
  radius_km: number;
  days: Array<{
    date: string; // YYYY-MM-DD
    source: string;
    feature_collection: FeatureCollection;
  }>;
};

export const fetchYear = async (year: number, radiusKm = 500): Promise<YearResponse> => {
  const res = await api.get<YearResponse>("/ice_extent/by_year", { params: { year, radius_km: radiusKm } });
  return res.data;
};

