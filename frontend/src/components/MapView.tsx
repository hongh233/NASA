import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { FeatureCollection } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";
import parsedEnv from "../config/env";

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const accessToken = parsedEnv.VITE_MAPBOX_TOKEN;

  useEffect(() => {
    if (!accessToken) {
      console.error("VITE_MAPBOX_TOKEN is missing; Mapbox map cannot initialize.");
      return;
    }

    if (mapRef.current || !mapContainer.current) return;

    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-74.0060152, 40.7127281],
      zoom: 5,
      maxZoom: 6
    });
    mapRef.current = map;

    map.on("load", async () => {
      try {
        const response = await fetch("/dataset/seaice_extent_filtered.geojson");
        if (!response.ok) {
          throw new Error(`Failed to load ice dataset: ${response.statusText}`);
        }
        console.log("Dataset fetch response:", response);

        const iceData = (await response.json()) as FeatureCollection;
        console.log("Ice Data:", iceData);

        map.addSource("iceLoss", {
          type: "geojson",
          data: iceData,
        });

        map.addLayer({
          id: "iceLoss-fill",
          type: "fill",
          source: "iceLoss",
          paint: {
            "fill-color": "#ff4b4b",
            "fill-opacity": 0.6,
          },
        });
      } catch (error) {
        console.error("Error loading ice dataset:", error);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [accessToken]);

  return <div ref={mapContainer} className="map-container" />;
};

export default MapView;
