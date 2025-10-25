import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

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
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE}/ice_loss`);
      map.addSource("iceLoss", { type: "geojson", data });
      map.addLayer({
        id: "iceLoss",
        type: "fill",
        source: "iceLoss",
        paint: {
          "fill-color": "#ff4b4b",
          "fill-opacity": 0.6,
        },
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [accessToken]);

  return <div ref={mapContainer} className="map-container" />;
};

export default MapView;
