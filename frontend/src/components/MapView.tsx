import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { FeatureCollection } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";
import parsedEnv from "../config/env";
import AnimatedRouteOverlay from "./routePredictions/AnimatedRouteOverlay";

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
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
      setIsMapLoaded(true);
      try {
        const response = await fetch("/dataset/seaice_extent.geojson");
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
          type: "circle",
          source: "iceLoss",
          paint: {
            "circle-radius": 3, 
            "circle-color": "#ff4b4b", 
            "circle-opacity": 0.7, 
          },
        });
      } catch (error) {
        console.error("Error loading ice dataset:", error);
      }
    });

    return () => {
      setIsMapLoaded(false);
      map.remove();
      mapRef.current = null;
    };
  }, [accessToken]);

  return (
    <div className="map-container">
      <div ref={mapContainer} className="map-canvas" />
      <AnimatedRouteOverlay map={mapRef.current} isMapLoaded={isMapLoaded} />
    </div>
  );
};

export default MapView;
