import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";

const MapView = () => {
  const { i18n, t } = useTranslation();
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

    // Set map language based on current i18n language
    const mapLanguage = i18n.language === 'fr' ? 'fr' : 'en';

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-74.0060152, 40.7127281],
      zoom: 5,
      maxZoom: 6,
      attributionControl: false // We'll add a custom one with localized text
    });
    mapRef.current = map;

    // Add navigation controls with localized tooltips
    const nav = new mapboxgl.NavigationControl({
      visualizePitch: true
    });
    map.addControl(nav, 'top-right');

    // Add a custom attribution control with localized text
    map.addControl(new mapboxgl.AttributionControl({
      compact: false
    }), 'bottom-right');

    map.on("load", async () => {
      // Set map language for labels
      updateMapLanguage(map, mapLanguage);
      
      try {
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

        // Add a popup with localized text when clicking on ice loss areas
        map.on('click', 'iceLoss', (e) => {
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<strong>${t('map.iceLayer')}</strong><br>${t('stats.title')}`)
            .addTo(map);
        });

        // Change cursor to pointer when hovering over ice loss areas
        map.on('mouseenter', 'iceLoss', () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'iceLoss', () => {
          map.getCanvas().style.cursor = '';
        });

      } catch (error) {
        console.warn("Ice loss data not available:", error);
        
        // Show error message in current language
        const errorPopup = new mapboxgl.Popup({ closeOnClick: false })
          .setLngLat([-74.0060152, 40.7127281])
          .setHTML(`<div style="color: #ff6b6b; padding: 10px;">⚠️ ${t('map.error')}</div>`)
          .addTo(map);
        
        // Auto-close after 5 seconds
        setTimeout(() => errorPopup.remove(), 5000);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [accessToken, t]); // Include 't' to re-render when translations change

  // Effect to handle language changes after map is initialized
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const mapLanguage = i18n.language === 'fr' ? 'fr' : 'en';

    // Wait for map to be loaded before changing language
    if (map.isStyleLoaded()) {
      updateMapLanguage(map, mapLanguage);
    } else {
      map.on('styledata', () => updateMapLanguage(map, mapLanguage));
    }
  }, [i18n.language]);

  const updateMapLanguage = (map: mapboxgl.Map, language: string) => {
    try {
      // Update various label layers to show text in the selected language
      const labelLayers = [
        'country-label',
        'state-label', 
        'settlement-major-label',
        'settlement-minor-label',
        'poi-label',
        'water-label',
        'natural-label'
      ];

      labelLayers.forEach(layerId => {
        if (map.getLayer(layerId)) {
          // Try different field names that Mapbox uses for multilingual labels
          const fieldOptions = [`name_${language}`, `name`, 'name_en'];
          
          for (const field of fieldOptions) {
            try {
              map.setLayoutProperty(layerId, 'text-field', ['get', field]);
              break; // If successful, stop trying other fields
            } catch (error) {
              continue; // Try next field if this one fails
            }
          }
        }
      });

      console.log(`Map language updated to: ${language}`);
    } catch (error) {
      console.warn('Could not update map language:', error);
    }
  };

  return <div ref={mapContainer} className="map-container" />;
};

export default MapView;
