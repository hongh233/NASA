import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import parsedEnv from "../config/env";
import { useIceExtentContext } from "../context/IceExtentContext";
import AnimatedRouteOverlay, { type RouteControls } from "./routePredictions/AnimatedRouteOverlay";

type MapViewProps = {
  onRouteStatusChange?: (status: string) => void;
  onRouteControlsChange?: (controls: RouteControls) => void;
};

const MapView = ({ onRouteStatusChange, onRouteControlsChange }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { data: iceData } = useIceExtentContext();
  const accessToken = parsedEnv.VITE_MAPBOX_TOKEN;

  // Initialize the map
  useEffect(() => {
    if (!accessToken) {
      console.error("VITE_MAPBOX_TOKEN is missing; Mapbox map cannot initialize.");
      return;
    }

    if (mapRef.current || !mapContainer.current) return;

    mapboxgl.accessToken = accessToken;

    // set the default center of the map to hudson bay
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-74.0060152, 40.7127281],
      zoom: 5,
      maxZoom: 6
    });
    mapRef.current = map;

    map.on("load", () => {
      setIsMapLoaded(true);
    });

    return () => {
      setIsMapLoaded(false);
      map.remove();
      mapRef.current = null;
    };
  }, [accessToken]);

  // Update ice extent data on the map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded || !iceData) return;

    // Remove previous layer/source if they exist
    if (map.getLayer("iceLoss-fill")) {
      map.removeLayer("iceLoss-fill");
    }
    if (map.getSource("iceLoss")) {
      map.removeSource("iceLoss");
    }

    // Add new source and layer
    map.addSource("iceLoss", {
      type: "geojson",
      data: iceData
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
  }, [iceData, isMapLoaded]);

  return (
    <div className="map-container">
      <div ref={mapContainer} className="map-canvas" />
      <AnimatedRouteOverlay
        map={mapRef.current}
        isMapLoaded={isMapLoaded}
        onStatusChange={onRouteStatusChange}
        onControlsChange={onRouteControlsChange}
      />
    </div>
  );
};

export default MapView;
