import api from "../api/mapAPI";

export type AvailableDatesResponse = {
  count: number;
  dates: string[]; // ISO YYYY-MM-DD
};

export const fetchAvailableDates = async (): Promise<string[]> => {
  const res = await api.get<AvailableDatesResponse>("/ice_extent/available_dates");
  return res.data.dates ?? [];
};

