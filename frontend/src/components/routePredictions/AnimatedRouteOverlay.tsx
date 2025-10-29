import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { FeatureCollection, Position } from "geojson";

export type RouteControls = {
  clearMarkers: () => void;
  hasMarkers: boolean;
};

type AnimatedRouteOverlayProps = {
  map: mapboxgl.Map | null;
  isMapLoaded: boolean;
  onStatusChange?: (status: string) => void;
  onControlsChange?: (controls: RouteControls) => void;
  predictedData?: FeatureCollection | null;
  iceData?: FeatureCollection | null; 
};

type MarkerPair = {
  start?: mapboxgl.Marker;
  end?: mapboxgl.Marker;
};

const EMPTY_FEATURE_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

const AnimatedRouteOverlay = ({
  map,
  isMapLoaded,
  onStatusChange,
  onControlsChange,
  predictedData,
  iceData,
}: AnimatedRouteOverlayProps) => {
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const markersRef = useRef<MarkerPair>({});
  const [markerPositions, setMarkerPositions] = useState<{ start?: Position; end?: Position }>({});
  const [status, setStatus] = useState<string>("idle");

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const resetAnimatedSource = useCallback(() => {
    if (!map) return;
    const src = map.getSource("animated-route") as mapboxgl.GeoJSONSource | undefined;
    src?.setData(EMPTY_FEATURE_COLLECTION);
  }, [map]);

  const updateMarkerPositions = useCallback(() => {
    const next: { start?: Position; end?: Position } = {};
    const start = markersRef.current.start?.getLngLat();
    const end = markersRef.current.end?.getLngLat();

    if (start) next.start = [start.lng, start.lat];
    if (end) next.end = [end.lng, end.lat];

    setMarkerPositions(next);
  }, []);

  const placeMarker = useCallback(
    (lnglat: Position) => {
      if (!map) return;

      let { start, end } = markersRef.current;

      if (start && end) {
        start.remove();
        end.remove();
        start = undefined;
        end = undefined;
        stopAnimation();
        resetAnimatedSource();
      }

      if (!start) {
        start = new mapboxgl.Marker({ color: "green" })
          .setLngLat(lnglat as [number, number])
          .addTo(map);
      } else if (!end) {
        end = new mapboxgl.Marker({ color: "red" })
          .setLngLat(lnglat as [number, number])
          .addTo(map);
      }

      markersRef.current = { start, end };
      updateMarkerPositions();
    },
    [map, resetAnimatedSource, stopAnimation, updateMarkerPositions]
  );

  const clearMarkers = useCallback(() => {
    const { start, end } = markersRef.current;
    start?.remove();
    end?.remove();
    markersRef.current = {};
    stopAnimation();
    resetAnimatedSource();
    setMarkerPositions({});
  }, [resetAnimatedSource, stopAnimation]);

  const startAnimation = useCallback(
    (coords: Position[]) => {
      if (!map || !coords.length) return;

      stopAnimation();
      resetAnimatedSource();

      const src = map.getSource("animated-route") as mapboxgl.GeoJSONSource | undefined;
      if (!src) return;

      startTimeRef.current = performance.now();
      const duration = Math.max(3000, coords.length * 30);

      const step = (timestamp: number) => {
        const elapsed = timestamp - startTimeRef.current;
        const t = Math.min(1, elapsed / duration);
        const index = Math.max(0, Math.floor(t * (coords.length - 1)));
        const subset = coords.slice(0, index + 1);

        const feature: FeatureCollection = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: { type: "LineString", coordinates: subset },
              properties: {},
            },
          ],
        };

        src.setData(feature);

        if (t < 1) {
          animationRef.current = requestAnimationFrame(step);
        } else {
          animationRef.current = null;
        }
      };

      animationRef.current = requestAnimationFrame(step);
    },
    [map, resetAnimatedSource, stopAnimation]
  );

  const extractFirstLineCoords = useCallback((geo: FeatureCollection): Position[] => {
    for (const feature of geo.features) {
      if (feature.geometry?.type === "LineString") {
        return feature.geometry.coordinates as Position[];
      }
      if (feature.geometry?.type === "MultiLineString") {
        const lines = feature.geometry.coordinates as Position[][];
        if (lines.length) return lines[0] as Position[];
      }
    }
    return [];
  }, []);

  const requestRouteNavigation = useCallback(
    async (start: Position, end: Position) => {
      const geojsonData = predictedData ?? iceData;
      if (!map || !geojsonData) {
        console.warn("No geojson data available for routing");
        return;
      }

      console.log("Routing using:", predictedData ? "predictedData" : "iceData");

      setStatus("requesting");
      try {
        const resp = await fetch("http://127.0.0.1:5001/api/route_navigation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            start,
            end,
            geojson: geojsonData,
          }),
        });

        if (!resp.ok) throw new Error(`Server error ${resp.status}`);
        const geoPredictions = (await resp.json()) as FeatureCollection;

        const coords = extractFirstLineCoords(geoPredictions);
        if (coords.length) {
          startAnimation(coords);
        } else {
          throw new Error("Route response missing coordinates");
        }
      } catch (err) {
        console.warn("Route navigation failed, falling back to sample dataset", err);
        try {
          const fallback = await fetch("/dataset/hudson-bay.geojson");
          if (!fallback.ok) throw new Error(fallback.statusText);
          const geo = (await fallback.json()) as FeatureCollection;
          const coords = extractFirstLineCoords(geo);
          if (coords.length) startAnimation(coords);
        } catch (fallbackErr) {
          console.error("Fallback route load failed", fallbackErr);
        }
      } finally {
        setStatus("idle");
      }
    },
    [extractFirstLineCoords, map, startAnimation, predictedData, iceData] 
  );

  useEffect(() => {
    if (!map || !isMapLoaded) return;

    let isActive = true;

    const ensureHudsonRoute = async () => {
      if (!map || map.getSource("hudson-route")) return;

      try {
        const res = await fetch("/dataset/hudson-bay.geojson");
        if (!res.ok) throw new Error(res.statusText);
        const data = (await res.json()) as FeatureCollection;
        if (!isActive || !map || map.getSource("hudson-route")) return;

        map.addSource("hudson-route", { type: "geojson", data });
        map.addLayer({
          id: "hudson-route-line",
          type: "line",
          source: "hudson-route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#888", "line-width": 2, "line-opacity": 0.6 },
        });
      } catch (err) {
        console.warn("Could not load hudson-bay.geojson", err);
      }
    };

    const ensureAnimatedSource = () => {
      if (!map) return;
      if (!map.getSource("animated-route")) {
        map.addSource("animated-route", { type: "geojson", data: EMPTY_FEATURE_COLLECTION });
      }

      if (!map.getLayer("animated-route-line")) {
        map.addLayer({
          id: "animated-route-line",
          type: "line",
          source: "animated-route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#ff4b4b", "line-width": 4, "line-opacity": 0.95 },
        });
      }
    };

    ensureHudsonRoute();
    ensureAnimatedSource();

    const handleClick = (event: mapboxgl.MapMouseEvent) => {
      placeMarker([event.lngLat.lng, event.lngLat.lat]);
    };

    map.on("click", handleClick);

    return () => {
      isActive = false;
      map.off("click", handleClick);
      stopAnimation();
      const { start, end } = markersRef.current;
      start?.remove();
      end?.remove();
      markersRef.current = {};
      setMarkerPositions({});

      if (map.getLayer("animated-route-line")) map.removeLayer("animated-route-line");
      if (map.getSource("animated-route")) map.removeSource("animated-route");
      if (map.getLayer("hudson-route-line")) map.removeLayer("hudson-route-line");
      if (map.getSource("hudson-route")) map.removeSource("hudson-route");
    };
  }, [isMapLoaded, map, placeMarker, stopAnimation]);

  const hasMarkers = useMemo(() => Boolean(markerPositions.start || markerPositions.end), [markerPositions]);

  useEffect(() => {
    onControlsChange?.({ clearMarkers, hasMarkers });
  }, [clearMarkers, hasMarkers, onControlsChange]);

  useEffect(
    () => () => {
      onControlsChange?.({ clearMarkers: () => {}, hasMarkers: false });
    },
    [onControlsChange]
  );

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    const { start, end } = markerPositions;
    if (!start || !end) return;
    requestRouteNavigation(start, end);
  }, [markerPositions, requestRouteNavigation]);

  if (!map) return null;
  return null;
};

export default AnimatedRouteOverlay;
