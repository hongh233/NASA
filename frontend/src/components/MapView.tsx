import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import parsedEnv from "../config/env";
import { useIceExtentContext } from "../context/IceExtentContext";
import AnimatedRouteOverlay, { type RouteControls } from "./routePredictions/AnimatedRouteOverlay";
import "./MapView.css";
import type { FeatureCollection } from "geojson";
import TopPositionBar from "./TopPositionBar";

type MapViewProps = {
  predictedData: FeatureCollection | null;
  onRouteStatusChange: (status: string) => void;
  onRouteControlsChange: (controls: RouteControls) => void;
  onViewChange?: (view: { lat: number; lon: number; zoom: number }) => void;
};

const MapView = ({ 
  predictedData, 
  onRouteStatusChange, 
  onRouteControlsChange,
}: MapViewProps) => {

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { data: iceData, isLoading } = useIceExtentContext();
  const accessToken = parsedEnv.VITE_MAPBOX_TOKEN;
  const [currentView, setCurrentView] = useState<{ lat: number; lon: number; zoom: number } | null>(null);


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
      center: [-76.0060152, 58.7127281],
      zoom: 3.5,
      maxZoom: 6,
      pitch: 0,
      bearing: 0,
      dragRotate: true,
      touchPitch: true
    });
    mapRef.current = map;

    map.on("load", () => {
      setIsMapLoaded(true);

      const nav = new mapboxgl.NavigationControl({ visualizePitch: true });
      map.addControl(nav, "top-right");

      // map.setPaintProperty('water', 'fill-color', '#243447');
      // map.setPaintProperty('waterway', 'line-color', '#004cff');

      map.once("render", () => {
        const compassButton = document.querySelector(".mapboxgl-ctrl-compass") as HTMLButtonElement | null;
        if (compassButton) {
          compassButton.onclick = () => {
            const currentPitch = map.getPitch();
            if (currentPitch < 5) {
              map.easeTo({ pitch: 45, duration: 600 });
            } else {
              map.easeTo({ pitch: 0, duration: 600 });
            }
          };
        }
      });
    });


    return () => {
      setIsMapLoaded(false);
      map.remove();
      mapRef.current = null;
    };
  }, [accessToken]);

  // Update ice extent data on the map, hide it when predictions are visible
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

    if (predictedData) return;

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
        "circle-color": "#ffffff",
        "circle-opacity": 0.5,
      },
    });
  }, [iceData, isMapLoaded, predictedData]);

  // Update predicted data on the map (separate layer)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    if (map.getLayer("predictedIce-fill")) {
      map.removeLayer("predictedIce-fill");
    }
    if (map.getSource("predictedIce")) {
      map.removeSource("predictedIce");
    }

    if (!predictedData) return;

    map.addSource("predictedIce", {
      type: "geojson",
      data: predictedData,
    });

    map.addLayer({
      id: "predictedIce-fill",
      type: "circle",
      source: "predictedIce",
      paint: {
        "circle-radius": 3,
        "circle-color": "#a8e6ff",
        "circle-opacity": 0.5,
      },
    });
  }, [predictedData, isMapLoaded]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    const updateViewState = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();

      setCurrentView({
        lat: center.lat,
        lon: center.lng,
        zoom,
      });
    };

    updateViewState();

    map.on('move', updateViewState);
    map.on('zoom', updateViewState);

    return () => {
      map.off('move', updateViewState);
      map.off('zoom', updateViewState);
    };
  }, [isMapLoaded]);

  return (
    <div className="map-container">
      <div ref={mapContainer} className="map-canvas" />
      <div className="map-center-crosshair" />

        <TopPositionBar view={currentView} />
        
        {isLoading ? (
          <div className="map-loading-overlay" role="status" aria-live="polite">
            <div className="map-loading-spinner" />
            <div className="map-loading-text">Loading data…</div>
          </div>
        ) : null}

        <AnimatedRouteOverlay
          map={mapRef.current}
          isMapLoaded={isMapLoaded}
          onStatusChange={onRouteStatusChange}
          onControlsChange={onRouteControlsChange}
          predictedData={predictedData}
          iceData={iceData}
        />
    </div>
  );
};

export default MapView;
