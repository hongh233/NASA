import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FeatureCollection } from "geojson";
import { fetchIceExtentCoordinates } from "../services/iceExtentAPI";
import { fetchAvailableDates } from "../services/availabilityAPI";
import { fetchYear } from "../services/yearAPI";
import type { IceExtentResponse } from "../types";

type IceExtentContextValue = {
  selectedDate: Date;
  isoDate: string;
  availableDates: string[];
  data: FeatureCollection | null;
  metadata: Omit<IceExtentResponse, "feature_collection"> | null;
  isLoading: boolean;
  error?: string;
  shiftDate: (days: number) => void;
  setDateFromIso: (isoDate: string) => void;
  refetch: () => void;
};

const IceExtentContext = createContext<IceExtentContextValue | undefined>(undefined);

const isoFromDate = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const dateFromIso = (iso: string): Date | null => {
  const parts = iso.split("-");
  if (parts.length !== 3) return null;
  const [yearStr, monthStr, dayStr] = parts;
  const year = Number.parseInt(yearStr, 10);
  const month = Number.parseInt(monthStr, 10);
  const day = Number.parseInt(dayStr, 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
};

const EMPTY_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export const IceExtentProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  });
  const [data, setData] = useState<FeatureCollection | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Omit<IceExtentResponse, "feature_collection"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [reloadToken, setReloadToken] = useState(0);
  const yearCacheRef = ((globalThis as any).__ICE_YEAR_CACHE__ ?? new Map<number, Map<string, FeatureCollection>>()) as Map<number, Map<string, FeatureCollection>>;
  const yearInFlightRef = ((globalThis as any).__ICE_YEAR_INFLIGHT__ ?? new Set<number>()) as Set<number>;
  const yearFailedRef = ((globalThis as any).__ICE_YEAR_FAILED__ ?? new Set<number>()) as Set<number>;
  (globalThis as any).__ICE_YEAR_CACHE__ = yearCacheRef;
  (globalThis as any).__ICE_YEAR_INFLIGHT__ = yearInFlightRef;
  (globalThis as any).__ICE_YEAR_FAILED__ = yearFailedRef;

  const isoDate = useMemo(() => isoFromDate(selectedDate), [selectedDate]);

  // Load available dates and snap to nearest valid on first load
  useEffect(() => {
    let isActive = true;
    fetchAvailableDates()
      .then((list) => {
        if (!isActive) return;
        setAvailableDates(list);
        if (list.length > 0) {
          const currentIso = isoFromDate(selectedDate);
          if (!list.includes(currentIso)) {
            const nearest = list.find((d) => d >= currentIso) ?? list[list.length - 1];
            const dt = dateFromIso(nearest);
            if (dt) setSelectedDate(dt);
          }
        }
      })
      .catch(() => setAvailableDates([]));
    return () => { isActive = false; };
  }, []);

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  // Ensure year cache only when year changes and exists
  useEffect(() => {
    const year = selectedDate.getUTCFullYear();
    if (!availableDates.some((d) => d.startsWith(String(year)))) return;
    if (yearCacheRef.has(year) || yearInFlightRef.has(year) || yearFailedRef.has(year)) return;
    yearInFlightRef.add(year);
    fetchYear(year)
      .then((resp) => {
        const map = new Map<string, FeatureCollection>();
        resp.days.forEach((d) => map.set(d.date, d.feature_collection));
        yearCacheRef.set(year, map);
      })
      .catch((err: any) => {
        if (err?.response?.status === 404) yearFailedRef.add(year);
      })
      .finally(() => {
        yearInFlightRef.delete(year);
      });
  }, [availableDates, selectedDate]);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(undefined);

    const year = selectedDate.getUTCFullYear();
    const cached = yearCacheRef.get(year)?.get(isoDate);
    if (cached) {
      setData(cached);
      setMetadata({ date: isoDate, source: "cache", radius_km: 500 });
      setIsLoading(false);
      return () => { isActive = false; };
    }

    if (yearInFlightRef.has(year)) {
      setIsLoading(false);
      return () => { isActive = false; };
    }

    fetchIceExtentCoordinates(isoDate)
      .then((response) => {
        if (!isActive) return;
        setData(response.feature_collection ?? EMPTY_COLLECTION);
        const { feature_collection: _ignored, ...rest } = response;
        setMetadata(rest);
      })
      .catch((err: Error) => {
        if (!isActive) return;
        setError(err.message);
        setData(null);
        setMetadata(null);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isoDate, reloadToken, selectedDate]);

  const shiftDate = useCallback((days: number) => {
    if (!Number.isFinite(days) || !days) return;
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setUTCDate(next.getUTCDate() + days);
      return next;
    });
  }, []);

  const setDateFromIso = useCallback((iso: string) => {
    const parsed = dateFromIso(iso);
    if (!parsed) return;
    setSelectedDate(parsed);
  }, []);

  const value: IceExtentContextValue = useMemo(
    () => ({
      selectedDate,
      isoDate,
      availableDates,
      data,
      metadata,
      isLoading,
      error,
      shiftDate,
      setDateFromIso,
      refetch,
    }),
    [availableDates, data, error, isLoading, isoDate, metadata, refetch, selectedDate, setDateFromIso, shiftDate]
  );

  return <IceExtentContext.Provider value={value}>{children}</IceExtentContext.Provider>;
};

export const useIceExtentContext = () => {
  const ctx = useContext(IceExtentContext);
  if (!ctx) {
    throw new Error("useIceExtentContext must be used within an IceExtentProvider");
  }
  return ctx;
};
