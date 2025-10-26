import api from "../api/mapAPI";
import type { YearResponse } from "../types";

export const fetchYear = async (year: number, radiusKm = 500): Promise<YearResponse> => {
  const res = await api.get<YearResponse>("/ice_extent/by_year", { 
    params: { 
      year, 
      radius_km: radiusKm 
    } 
  });
  return res.data;
};

