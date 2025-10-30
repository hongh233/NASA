import { useCallback, useState, useEffect } from "react";
import { Calendar } from "../components/Calendar/Calendar"; 
import MapView from "../components/MapView";
import RightStatsPanel from "../components/RightStatsPanel";
import type { RouteControls } from "../components/routePredictions/AnimatedRouteOverlay";
import type { FeatureCollection } from "geojson";
import { useIceExtentContext } from "../context/IceExtentContext";
import { ChatBox } from "../components/ChatBox";
import { ToolBar } from "../components/ToolBar/ToolBar";

const HomePage = () => {
  const { isoDate } = useIceExtentContext();
  const [routeStatus, setRouteStatus] = useState("idle");
  const [routeControls, setRouteControls] = useState<RouteControls>({
    clearMarkers: () => {},
    hasMarkers: false,
  });
  const [predictedData, setPredictedData] = useState<FeatureCollection | null>(null);

  // reset prediction when timeline changes date
  useEffect(() => {
    if (predictedData !== null) {
      setPredictedData(null);
    }
  }, [isoDate]);

  const handleRouteControlsChange = useCallback((controls: RouteControls) => {
    setRouteControls((prev) => {
      if (prev.clearMarkers === controls.clearMarkers && prev.hasMarkers === controls.hasMarkers) {
        return prev;
      }
      return controls;
    });
  }, []);

  return (
    <div className="app-shell">
      <div className="map-frame">

        {/* --- Tool Sidebar --- */}
        <ToolBar
          routeControls={routeControls}
          routeStatus={routeStatus}
          onRouteStatusChange={setRouteStatus}
          setPredictedData={setPredictedData}
        />

        {/* --- Map View --- */}
        <MapView
          onRouteStatusChange={setRouteStatus}
          onRouteControlsChange={handleRouteControlsChange}
          predictedData={predictedData}
        />

        {/* --- Calendar Module (bottom timeline) --- */}
        <Calendar />
      </div>

      {/* --- Right Stats Panel & Chat --- */}
      <RightStatsPanel predictedData={predictedData} />
      <ChatBox />
    </div>
  );
};

export default HomePage;
